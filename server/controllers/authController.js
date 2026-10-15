const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1d' });
};

exports.register = async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    if (!process.env.CLIENT_URL) {
      return res.status(500).json({ success: false, message: 'Client URL is not configured.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or Username is already registered.' });
    }

    const user = new User({
      username,
      name,
      email,
      password,
      role: 'user',
      isVerified: false,
    });

    const rawToken = user.createEmailVerificationToken();
    await user.save();

    // The client route is intentionally a query-string URL so it works across devices and browsers.
    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, '');
    const verificationUrl = `${clientUrl}/verify?token=${encodeURIComponent(rawToken)}`;
    const htmlMessage = `
      <h3>Welcome to CelestiCare, ${user.username}</h3>
      <p>Please confirm your email address to activate your account.</p>
      <a href="${verificationUrl}">Verify Email Address</a>
    `;

    try {
      await sendEmail({ email: user.email, subject: 'CelestiCare Verification', html: htmlMessage });
      res.status(201).json({ success: true, message: 'Verification link sent via Brevo.' });
    } catch (emailError) {
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email dispatch failed.' });
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const rawToken = req.params.token || req.query.token;
    if (!rawToken) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Link is invalid or has expired.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Account verified! You may now log in.' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isAdminUser = user.role === 'admin' || user.is_admin === true;
    if (isAdminUser && user.role !== 'admin') {
      user.role = 'admin';
      await user.save({ validateBeforeSave: false });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Account unverified. Check your Brevo email.' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        role: isAdminUser ? 'admin' : user.role,
        is_admin: isAdminUser || user.is_admin === true,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const allowedFields = ['name', 'gender', 'birthdate', 'zodiac_sign', 'undertone'];
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        user[field] = field === 'birthdate' && !req.body[field] ? null : (req.body[field] || '');
      }
    }

    if (req.body.new_password) {
      if (!req.body.current_password || !(await user.matchPassword(req.body.current_password))) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      if (req.body.new_password !== req.body.confirm_password) {
        return res.status(400).json({ success: false, message: 'New passwords do not match.' });
      }
      user.password = req.body.new_password;
    }

    await user.save();
    const profile = user.toObject();
    delete profile.password;
    res.status(200).json({ success: true, message: 'Profile updated successfully.', user: profile, data: profile });
  } catch (error) {
    next(error);
  }
};

exports.updateAesthetic = async (req, res, next) => {
  try {
    const { aesthetic_result } = req.body;

    if (!aesthetic_result) {
      return res.status(400).json({ success: false, message: 'Aesthetic result is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.aesthetic_result = aesthetic_result;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Aesthetic saved successfully',
      aesthetic_result: user.aesthetic_result
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUndertone = async (req, res, next) => {
  try {
    const { undertone, zodiac_sign } = req.body;
    if (!['cool', 'neutral', 'warm'].includes(String(undertone).toLowerCase())) {
      return res.status(400).json({ success: false, message: 'A valid undertone is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.undertone = String(undertone).toLowerCase();
    if (zodiac_sign) user.zodiac_sign = zodiac_sign;
    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.setupSecurity = async (req, res, next) => {
  try {
    const questions = [1, 2, 3].map((number) => ({
      question: String(req.body[`question${number}`] || '').trim(),
      answer: String(req.body[`answer${number}`] || '').trim(),
    }));
    if (questions.some(({ question, answer }) => !question || !answer)) {
      return res.status(400).json({ success: false, message: 'Choose and answer all three security questions.' });
    }
    if (new Set(questions.map(({ question }) => question)).size !== questions.length) {
      return res.status(400).json({ success: false, message: 'Choose three different security questions.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    user.security_questions = await Promise.all(questions.map(async ({ question, answer }) => ({
      question,
      answerHash: await bcrypt.hash(answer.toLowerCase(), 10),
    })));
    user.security_setup_complete = true;
    await user.save();
    res.status(200).json({ success: true, message: 'Security questions saved successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.matchPassword(req.body.password || ''))) {
      return res.status(401).json({ success: false, message: 'Password is incorrect.' });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const logEmailError = (context, error) => {
  console.error(`[Email Error] ${context}`, {
    message: error.message,
    code: error.code,
    responseCode: error.responseCode,
    command: error.command,
    response: error.response,
  });
};

const getEmailFailureMessage = (error) => {
  if (error.message.includes('SMTP password')) {
    return 'Render has an SMTP password in BREVO_API_KEY. Add a Brevo API key starting with xkeysib-.';
  }

  if (error.code === 'BREVO_API_ERROR' && error.responseCode === 401) {
    return 'Brevo rejected the API key. Create a new Brevo API key and update BREVO_API_KEY in Render.';
  }

  if (error.code === 'BREVO_API_ERROR' && error.responseCode === 400) {
    return 'Brevo rejected the sender or recipient. Verify FROM_EMAIL as an authorized sender in Brevo.';
  }

  return 'Brevo could not send the verification email. Check the Render logs for the email error details.';
};

const getClientUrl = () => (process.env.CLIENT_URL || 'https://celesticare-deployed-client.vercel.app').replace(/\/$/, '');

const sendVerificationEmail = async (user, rawToken) => {
  const verificationUrl = `${getClientUrl()}/verify?token=${encodeURIComponent(rawToken)}`;
  const htmlMessage = `
    <h3>Welcome to CelestiCare, ${user.username}</h3>
    <p>Please confirm your email address to activate your account.</p>
    <p><a href="${verificationUrl}">Verify Email Address</a></p>
    <p>If the button does not work, copy and paste this link into your browser:</p>
    <p>${verificationUrl}</p>
  `;

  return sendEmail({
    email: user.email,
    subject: 'CelestiCare Verification',
    html: htmlMessage,
    text: `Verify your CelestiCare account: ${verificationUrl}`,
  });
};

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

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email && !existingUser.isVerified) {
        const rawToken = existingUser.createEmailVerificationToken();
        await existingUser.save();
        try {
          const emailInfo = await sendVerificationEmail(existingUser, rawToken);
          console.log(`[Email] Verification resend accepted by SMTP: ${emailInfo.messageId}`);
          return res.status(201).json({ success: true, message: 'Verification email resent. Please check your inbox.' });
        } catch (emailError) {
          logEmailError('Verification resend failed', emailError);
          return res.status(502).json({ success: false, message: `Account found, but ${getEmailFailureMessage(emailError)}` });
        }
      }
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

    try {
      const emailInfo = await sendVerificationEmail(user, rawToken);
      console.log(`[Email] Verification accepted by SMTP: ${emailInfo.messageId}`);
      return res.status(201).json({ success: true, message: 'Verification email sent. Please check your inbox.' });
    } catch (emailError) {
      logEmailError('Verification email failed', emailError);
      return res.status(502).json({
        success: false,
        message: `Account created, but ${getEmailFailureMessage(emailError)}`,
      });
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

    if (Object.prototype.hasOwnProperty.call(req.body, 'username')) {
      const username = String(req.body.username || '').trim();
      if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required.' });
      }

      const existingUser = await User.findOne({ username, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'That username is already taken.' });
      }

      user.username = username;
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

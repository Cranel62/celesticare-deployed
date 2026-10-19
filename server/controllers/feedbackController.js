const UserFeedback = require('../models/UserFeedback');

const fields = ['experience', 'fashion_match', 'favorite_feature', 'vibe', 'suggestions'];

exports.submitFeedback = async (req, res, next) => {
  try {
    if (fields.slice(0, 4).some((field) => !String(req.body[field] || '').trim())) {
      return res.status(400).json({ success: false, message: 'Please complete all required feedback fields.' });
    }
    const feedback = await UserFeedback.create({
      user: req.user.id,
      ...Object.fromEntries(fields.map((field) => [field, String(req.body[field] || '').trim()]))
    });
    res.status(201).json({ success: true, feedback });
  } catch (error) { next(error); }
};

exports.getFeedback = async (req, res, next) => {
  try {
    const feedback = await UserFeedback.find().populate('user', 'username email').sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: feedback });
  } catch (error) { next(error); }
};

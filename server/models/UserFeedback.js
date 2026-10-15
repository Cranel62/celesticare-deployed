const mongoose = require('mongoose');

const userFeedbackSchema = new mongoose.Schema(
  {
    legacyId: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    experience: { type: String, default: '5' },
    fashion_match: { type: String, default: '' },
    favorite_feature: { type: String, default: '' },
    vibe: { type: String, default: '' },
    suggestions: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserFeedback', userFeedbackSchema);
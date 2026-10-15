const mongoose = require('mongoose');

const userOutfitSchema = new mongoose.Schema(
  {
    legacyId: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clothing_src: { type: String, default: '' },
    clothing_category: { type: String, default: null },
    clothing_style: { type: String, default: null },
    gender: { type: String, default: null },
    outfit_data: { type: mongoose.Schema.Types.Mixed }, // Handles JSON outfit array
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserOutfit', userOutfitSchema);
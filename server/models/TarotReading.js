const mongoose = require('mongoose');

const TarotReadingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reading_type: {
    type: String,
    enum: ['single', 'heart_path'],
    required: true
  },
  cards: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      arcana: { type: String },
      suit: { type: String },
      position: { type: String },
      title: { type: String },
      icon: { type: String }
    }
  ],
  interpretation: {
    type: String,
    default: ''
  },
  spread_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to quickly fetch recent readings within 7 days
TarotReadingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('TarotReading', TarotReadingSchema);
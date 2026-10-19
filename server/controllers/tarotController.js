const TarotReading = require('../models/TarotReading');
const User = require('../models/User');

// Mock partial deck for generation logic
const TAROT_DECK = [
  { id: 0, name: 'The Fool', suit: 'major', element: 'Air', keywords: 'beginnings, freedom, potential', fashion: 'Playful silhouettes', style_tip: 'Wear yellow accents' },
  { id: 1, name: 'The Magician', suit: 'major', element: 'Air', keywords: 'creation, power, skill', fashion: 'Structured blazers', style_tip: 'Add a bold red ring' },
  { id: 2, name: 'The High Priestess', suit: 'major', element: 'Water', keywords: 'intuition, mystery, subconscious', fashion: 'Flowy silks', style_tip: 'Silver moon pendants' },
  { id: 3, name: 'The Empress', suit: 'major', element: 'Earth', keywords: 'abundance, fertility, creativity', fashion: 'Floral patterns', style_tip: 'Soft blush tones' },
  { id: 4, name: 'The Emperor', suit: 'major', element: 'Fire', keywords: 'power, stability, leadership', fashion: 'Tailored suits', style_tip: 'Structured shoulders' },
  { id: 18, name: 'The Moon', suit: 'major', element: 'Water', keywords: 'intuition, mystery, dreams, illusion', fashion: 'Iridescent fabrics', style_tip: 'Wear color-shifting tones' }
];

// Returns 10 random cards for the fan animation
exports.drawFanCards = async (req, res, next) => {
  try {
    const count = parseInt(req.query.count, 10) || 10;
    // Map random cards up to 78 for UI variety
    const cards = Array.from({ length: count }, (_, i) => {
      const id = Math.floor(Math.random() * 78) + 1;
      return { id, name: `Card ${id}`, suit: 'major' };
    });
    res.status(200).json({ success: true, cards });
  } catch (error) {
    next(error);
  }
};

// Saves a reading payload from the frontend directly to MongoDB
exports.saveReading = async (req, res, next) => {
  try {
    const { reading_type, cards, interpretation, spread_data } = req.body;
    const reading = await TarotReading.create({
      user: req.user.id,
      reading_type,
      cards,
      interpretation,
      spread_data
    });
    if (reading_type === 'single' && cards?.[0]?.id !== undefined) {
      await User.findByIdAndUpdate(req.user.id, { selected_single_card: Number(cards[0].id) });
    }
    res.status(201).json({ success: true, reading_id: reading._id, message: 'Reading saved successfully' });
  } catch (error) {
    next(error);
  }
};

// Returns the most recent reading from the past 7 days for the Tarot Dashboard Banner
exports.getRecentReading = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = await TarotReading.findOne({
      user: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 });

    if (!recent) return res.status(200).json({ success: true, hasRecent: false });
    
    res.status(200).json({
      success: true,
      hasRecent: true,
      recent: {
        id: recent._id,
        reading_type: recent.reading_type,
        cardId: recent.reading_type === 'single' ? recent.cards?.[0]?.id ?? null : null,
        createdAt: recent.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Loads a specific saved reading by ID
exports.getReadingById = async (req, res, next) => {
  try {
    const reading = await TarotReading.findOne({ _id: req.params.id, user: req.user.id });
    if (!reading) return res.status(404).json({ success: false, message: 'Reading not found' });
    res.status(200).json({ success: true, reading });
  } catch (error) {
    next(error);
  }
};

// Auto-generates a 4 card spread payload dynamically if the user skips picking manually
exports.getSpread = async (req, res, next) => {
  try {
    const spreadType = req.query.type || 'four-card';
    if (spreadType === 'four-card') {
      const spread = TAROT_DECK.slice(0, 4).map((c, i) => ({
        position: ['past', 'heart', 'head', 'path'][i],
        card: c
      }));
      res.status(200).json({ success: true, spread, type: 'four-card' });
    } else {
      res.status(200).json({ success: true, card: TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)], type: 'single' });
    }
  } catch (error) {
    next(error);
  }
};

// Resolves standalone fashion advice per card
exports.getFashionAdvice = async (req, res, next) => {
  try {
    const cardId = parseInt(req.query.card_id, 10);
    const card = TAROT_DECK.find(c => c.id === cardId) || TAROT_DECK[0];
    res.status(200).json({
      success: true,
      card: card.name,
      fashion: card.fashion,
      style_tip: card.style_tip
    });
  } catch (error) {
    next(error);
  }
};

exports.getSelectedSingleCard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('selected_single_card').lean();
    res.status(200).json({ success: true, cardId: user?.selected_single_card ?? null });
  } catch (error) { next(error); }
};

exports.saveSelectedSingleCard = async (req, res, next) => {
  try {
    const cardId = Number(req.body.cardId);
    if (!Number.isInteger(cardId) || cardId < 0 || cardId > 77) {
      return res.status(400).json({ success: false, message: 'A valid card ID is required.' });
    }
    await User.findByIdAndUpdate(req.user.id, { selected_single_card: cardId });
    res.status(200).json({ success: true, cardId });
  } catch (error) { next(error); }
};

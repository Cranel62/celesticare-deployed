const UserOutfit = require('../models/UserOutfit');
const User = require('../models/User');

exports.saveOutfit = async (req, res, next) => {
  try {
    const { outfit_data, gender, clothing_style } = req.body;
    const userId = req.user.id;

    let outfit = await UserOutfit.findOne({ user: userId });
    
    if (outfit) {
      outfit.outfit_data = outfit_data;
      outfit.gender = gender;
      outfit.clothing_style = clothing_style;
      await outfit.save();
    } else {
      outfit = await UserOutfit.create({
        user: userId,
        outfit_data,
        gender,
        clothing_style
      });
    }

    await User.findByIdAndUpdate(userId, { style_result: clothing_style });

    res.status(200).json({ success: true, message: 'Outfit saved successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getLatestOutfit = async (req, res, next) => {
  try {
    const outfit = await UserOutfit.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!outfit) {
      return res.status(404).json({ success: false, message: 'No outfit found' });
    }
    res.status(200).json({ success: true, outfit });
  } catch (error) {
    next(error);
  }
};

exports.deleteOutfit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await UserOutfit.deleteMany({ user: userId });
    await User.findByIdAndUpdate(userId, { $unset: { style_result: "" } });
    res.status(200).json({ success: true, message: 'Outfit deleted successfully' });
  } catch (error) {
    next(error);
  }
};
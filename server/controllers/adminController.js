const crypto = require('crypto');
const User = require('../models/User');

const findManagedUser = (id) => User.findOne({
  _id: id,
  role: { $ne: 'admin' },
  is_admin: { $ne: true },
});

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('username email role createdAt deletedAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await findManagedUser(req.params.id)
      .select('username email role createdAt deletedAt aesthetic_result style_result zodiac_sign')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.archiveUser = async (req, res, next) => {
  try {
    const user = await findManagedUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.deletedAt = new Date();
    await user.save();
    res.status(200).json({ success: true, message: 'User archived.' });
  } catch (error) {
    next(error);
  }
};

exports.restoreUser = async (req, res, next) => {
  try {
    const user = await findManagedUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.deletedAt = null;
    await user.save();
    res.status(200).json({ success: true, message: 'User restored.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      role: { $ne: 'admin' },
      is_admin: { $ne: true },
      deletedAt: { $ne: null },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Archived user not found.' });
    }

    res.status(200).json({ success: true, message: 'User permanently deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.resetUserPassword = async (req, res, next) => {
  try {
    const user = await findManagedUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const temporaryPassword = crypto.randomBytes(12).toString('base64url');
    user.password = temporaryPassword;
    await user.save();
    res.status(200).json({ success: true, temporaryPassword });
  } catch (error) {
    next(error);
  }
};
const User = require('../models/User');
const UserFeedback = require('../models/UserFeedback');
const sendEmail = require('../utils/sendEmail');

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

    const feedbackCounts = await UserFeedback.aggregate([
      { $match: { user: { $in: users.map((user) => user._id) } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const countsByUserId = new Map(
      feedbackCounts.map((entry) => [String(entry._id), entry.count])
    );
    const usersWithFeedbackCounts = users.map((user) => ({
      ...user,
      feedbackCount: countsByUserId.get(String(user._id)) || 0,
    }));

    res.status(200).json({ success: true, data: usersWithFeedbackCounts });
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

    const feedback = await UserFeedback.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: { ...user, feedback } });
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
    const user = await User.findOne({
      _id: req.params.id,
      role: { $ne: 'admin' },
      is_admin: { $ne: true },
      deletedAt: { $ne: null },
    }).select('email isVerified');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Archived user not found.' });
    }

    if (!user.isVerified || !user.email) {
      return res.status(400).json({
        success: false,
        message: 'This user does not have a verified email address, so the account was not deleted.',
      });
    }

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your CelestiCare account has been deleted',
        html: '<p>Your CelestiCare account has been permanently deleted by an administrator.</p>',
        text: 'Your CelestiCare account has been permanently deleted by an administrator.',
      });
    } catch (emailError) {
      console.error('[Admin] Failed to send account deletion email:', emailError);
      return res.status(502).json({
        success: false,
        message: 'The deletion notice could not be sent, so the user was not deleted. Please try again.',
      });
    }

    const deletedUser = await User.findOneAndDelete({
      _id: user._id,
      role: { $ne: 'admin' },
      is_admin: { $ne: true },
      deletedAt: { $ne: null },
    });

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Archived user not found.' });
    }

    res.status(200).json({ success: true, message: 'User permanently deleted.' });
  } catch (error) {
    next(error);
  }
};

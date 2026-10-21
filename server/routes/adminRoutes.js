const express = require('express');
const {
	getUsers,
	getUser,
	archiveUser,
	restoreUser,
	deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', protect, authorize('admin'), getUsers);
router.get('/users/:id', protect, authorize('admin'), getUser);
router.patch('/users/:id/archive', protect, authorize('admin'), archiveUser);
router.patch('/users/:id/restore', protect, authorize('admin'), restoreUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;

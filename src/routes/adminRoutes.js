const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes require admin role
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/manage', adminController.manageUser);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
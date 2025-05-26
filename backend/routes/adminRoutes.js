const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

/**
 * @route   GET /admin/test
 * @desc    Only accessible by admin users to test admin access
 * @access  Private – Admin only
 */
router.get('/test', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({ message: '✅ Access granted: admin route reached.' });
});

module.exports = router;

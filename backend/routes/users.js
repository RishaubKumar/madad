// backend/routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Loan = require('../models/Loan');
const authenticateJWT = require('../middleware/authMiddleware');

// Get User Profile - Protected
router.get('/:id', authenticateJWT, async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the requesting user is accessing their own profile
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    // Find user by ID
    const user = await User.findById(userId).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Populate loan history
    await user.populate({
      path: 'loanHistory',
      populate: [
        { path: 'lender', select: 'name email' },
        { path: 'borrower', select: 'name email' },
      ]
    });

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

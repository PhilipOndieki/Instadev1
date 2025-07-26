const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get online users
router.get('/online', auth, async (req, res) => {
  try {
    const { skillLevel, primaryStack } = req.query;
    
    let filter = {
      isOnline: true,
      _id: { $ne: req.user._id } // Exclude current user
    };

    if (skillLevel) filter.skillLevel = skillLevel;
    if (primaryStack) filter.primaryStack = primaryStack;

    const users = await User.find(filter)
      .select('username skillLevel primaryStack isOnline lastSeen')
      .sort({ lastSeen: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username skillLevel primaryStack');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
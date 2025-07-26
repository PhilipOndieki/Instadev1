const express = require('express');
const Story = require('../models/Story');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all stories
router.get('/', auth, async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new story
router.post('/', auth, async (req, res) => {
  try {
    const { content, tags } = req.body;

    const story = new Story({
      content,
      tags: tags ? tags.split(' ').filter(tag => tag.startsWith('#')) : [],
      author: req.user._id
    });

    await story.save();
    await story.populate('author', 'username');

    res.status(201).json(story);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike story
router.post('/:id/like', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const isLiked = story.likes.includes(req.user._id);

    if (isLiked) {
      story.likes = story.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      story.likes.push(req.user._id);
    }

    await story.save();
    await story.populate('author', 'username');

    res.json(story);
  } catch (error) {
    console.error('Like story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retweet/unretweet story
router.post('/:id/retweet', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const isRetweeted = story.retweets.includes(req.user._id);

    if (isRetweeted) {
      story.retweets = story.retweets.filter(id => id.toString() !== req.user._id.toString());
    } else {
      story.retweets.push(req.user._id);
    }

    await story.save();
    await story.populate('author', 'username');

    res.json(story);
  } catch (error) {
    console.error('Retweet story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user owns the story
    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
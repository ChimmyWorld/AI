const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Create post with media
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const mediaFiles = [];

    // Upload media files if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const base64Data = file.buffer.toString('base64');
        const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64Data}`,
          { resource_type: mediaType }
        );
        
        mediaFiles.push({
          type: mediaType,
          url: result.secure_url
        });
      }
    }

    const post = new Post({
      title,
      content,
      category,
      author: req.userId,
      media: mediaFiles
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get posts by category
router.get('/category/:category', async (req, res) => {
  try {
    const posts = await Post.find({ category: req.params.category })
      .populate('author', 'username karma')
      .sort('-createdAt')
      .exec();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username karma')
      .sort('-createdAt')
      .exec();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single post with comments
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username karma')
      .populate('comments.author', 'username karma')
      .exec();
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      content: req.body.content,
      author: req.userId
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Vote on post
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.userId;
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    // Remove existing votes
    post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
    post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());

    // Add new vote
    if (voteType === 'up' && !hasUpvoted) {
      post.upvotes.push(userId);
    } else if (voteType === 'down' && !hasDownvoted) {
      post.downvotes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

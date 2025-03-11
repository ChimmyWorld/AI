const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const Notification = require('../models/notification');
const mongoose = require('mongoose'); // Added mongoose import

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

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    // Create a regex for case-insensitive search
    const searchRegex = new RegExp(q, 'i');
    
    // Search in title and content
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } }
      ]
    })
    .populate('author', 'username karma')
    .sort('-createdAt')
    .limit(10)
    .exec();
    
    res.json(posts);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
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
    
    // Get comment counts for each post from the Comment collection
    const Comment = mongoose.model('Comment');
    for (const post of posts) {
      if (post.commentCount === undefined || post.commentCount === null) {
        const count = await Comment.countDocuments({ post: post._id });
        post.commentCount = count;
        await post.save(); // Update the post with the correct count
      }
    }
    
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
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      content: req.body.content,
      author: req.userId
    });

    await post.save();

    // Create notification for post author if commenter is not the post author
    if (post.author && post.author._id.toString() !== req.userId.toString()) {
      const notification = new Notification({
        user: post.author._id,
        message: `${req.username || 'Someone'} commented on your post: "${post.title}"`,
        postId: post._id,
        read: false
      });
      await notification.save();
    }

    // Return the post with populated authors
    const updatedPost = await Post.findById(req.params.id)
      .populate('author', 'username karma')
      .populate('comments.author', 'username karma')
      .exec();
    
    res.status(201).json(updatedPost);
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

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the author of the post
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      id, 
      { 
        title, 
        content,
        category: category || post.category,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(updatedPost);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Find the comment
    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author of the comment
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    // Update comment
    comment.content = content;
    comment.updatedAt = Date.now();
    
    await post.save();
    
    // Return updated post with populated authors
    const updatedPost = await Post.findById(postId)
      .populate('author', 'username karma')
      .populate('comments.author', 'username karma')
      .exec();
    
    res.json(updatedPost);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Find the comment
    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author of the comment
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Remove the comment
    post.comments.pull(commentId);
    
    await post.save();
    
    // Return updated post with populated authors
    const updatedPost = await Post.findById(postId)
      .populate('author', 'username karma')
      .populate('comments.author', 'username karma')
      .exec();
    
    res.json(updatedPost);
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the author of the post
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get posts by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username karma')
      .sort('-createdAt')
      .exec();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get comments by user ID
router.get('/comments/user/:userId', async (req, res) => {
  try {
    // Find all posts with comments by this user
    const posts = await Post.find({ 'comments.author': req.params.userId })
      .populate('author', 'username karma')
      .exec();
    
    // Extract only the comments by the user from each post
    const userComments = [];
    posts.forEach(post => {
      const filteredComments = post.comments.filter(
        comment => comment.author.toString() === req.params.userId
      );
      filteredComments.forEach(comment => {
        userComments.push({
          postId: post._id,
          postTitle: post.title,
          comment: comment
        });
      });
    });
    
    // Sort by comment creation date, newest first
    userComments.sort((a, b) => new Date(b.comment.createdAt) - new Date(a.comment.createdAt));
    
    res.json(userComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

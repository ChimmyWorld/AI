const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Import models if they exist
let Post, Comment, User;
try {
  Post = require('../models/Post');
  Comment = require('../models/Comment'); 
  User = require('../models/User');
} catch (error) {
  console.error('Error importing models:', error);
  // Create placeholder models if they don't exist yet
  if (!Comment) {
    const commentSchema = new mongoose.Schema({
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
      createdAt: { type: Date, default: Date.now }
    });
    Comment = mongoose.model('Comment', commentSchema);
  }
}

// Get all comments for a post
router.get('/:postId', async (req, res) => {
  try {
    console.log(`Fetching comments for post ID: ${req.params.postId}`);
    
    // Validate if postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username avatar karma')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${comments.length} comments for post ID: ${req.params.postId}`);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new comment
router.post('/', auth, async (req, res) => {
  try {
    const { content, postId } = req.body;
    
    if (!content || !postId) {
      return res.status(400).json({ error: 'Content and postId are required' });
    }
    
    // Validate if postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = new Comment({
      content,
      author: req.user.id,
      post: postId
    });
    
    await comment.save();
    
    // Update the post's comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    
    // Populate author information before sending response
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar karma');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a comment
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid comment ID format' });
    }
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'User not authorized to update this comment' });
    }
    
    comment.content = content;
    await comment.save();
    
    // Populate author information before sending response
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar karma');
    
    res.json(populatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid comment ID format' });
    }
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'User not authorized to delete this comment' });
    }
    
    // Store the post ID before deleting the comment
    const postId = comment.post;
    
    await comment.deleteOne();
    
    // Decrement the post's comment count
    if (postId) {
      await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });
    }
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

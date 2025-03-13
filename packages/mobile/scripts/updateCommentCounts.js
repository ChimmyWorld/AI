require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

async function updateCommentCounts() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to database. Starting migration...');
    
    // Get all posts
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts to process`);
    
    // For each post, count comments and update the post
    for (const post of posts) {
      const commentCount = await Comment.countDocuments({ post: post._id });
      console.log(`Post ${post._id}: Found ${commentCount} comments`);
      
      await Post.findByIdAndUpdate(post._id, { commentCount });
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the migration
updateCommentCounts();

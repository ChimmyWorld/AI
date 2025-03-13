const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['free', 'qna', 'ai']
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: [{
    type: { type: String, enum: ['image', 'video'] },
    url: String
  }],
  comments: [commentSchema],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  commentCount: { type: Number, default: 0 } 
});

// Virtual for vote count
postSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Set toJSON option to include virtuals
postSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.votes = ret.voteCount;
    return ret;
  } 
});

module.exports = mongoose.model('Post', postSchema);

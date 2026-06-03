const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    // WHO wrote this post
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The post text content
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    // Array of user IDs who liked this post
    // Each item is just a reference to a User
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Array of comment objects
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Optional tags like ["hiring", "career", "tech"]
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ─── HELPER: generate consistent conversationId ───────────────────────────────
// Sort both IDs so "A_B" and "B_A" always produce the same string
// This means the conversation ID is the same regardless of who sends first
const getConversationId = (userId1, userId2) => {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

// ─── SEND A MESSAGE ───────────────────────────────────────────────────────────
// POST /api/messages/send
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    // Make sure recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Can't message yourself
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    const conversationId = getConversationId(req.user._id, recipientId);

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
      conversationId,
    });

    await message.save();

    // Populate sender info before sending back
    await message.populate('sender', 'name email');

    res.status(201).json({ message });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET CONVERSATION WITH A SPECIFIC USER ────────────────────────────────────
// GET /api/messages/conversation/:userId
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const conversationId = getConversationId(req.user._id, req.params.userId);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 }); // oldest first so chat reads top to bottom

    // Mark all unread messages in this conversation as read
    await Message.updateMany(
      { conversationId, recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ messages });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET ALL CONVERSATIONS (inbox) ────────────────────────────────────────────
// GET /api/messages/inbox
// Returns the last message from each unique conversation
router.get('/inbox', auth, async (req, res) => {
  try {
    // Find all messages where I am sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id },
      ],
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 }); // newest first

    // Group by conversationId and keep only the latest message per conversation
    const conversationMap = {};
    messages.forEach((msg) => {
      if (!conversationMap[msg.conversationId]) {
        conversationMap[msg.conversationId] = msg;
      }
    });

    // Convert the map back to an array
    const conversations = Object.values(conversationMap);

    res.json({ conversations });

  } catch (error) {
    console.error('Inbox error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
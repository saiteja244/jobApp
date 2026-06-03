const express = require('express');
const Connection = require('../models/Connection');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ─── GET ALL USERS (to browse and connect) ───────────────────────────────────
// GET /api/connections/users
// Returns all users except the logged-in user
router.get('/users', auth, async (req, res) => {
  try {
    // Find all users except the current user
    // { _id: { $ne: req.user._id } } means "where _id is NOT EQUAL to mine"
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name email bio skills')
      .limit(20);

    // Find all connections involving the current user
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id },
      ],
    });

    // For each user, figure out the connection status with current user
    // This tells the frontend whether to show Connect / Pending / Connected
    const usersWithStatus = users.map((u) => {
      const connection = connections.find(
        (c) =>
          c.requester.toString() === u._id.toString() ||
          c.recipient.toString() === u._id.toString()
      );

      return {
        ...u.toObject(),
        connectionStatus: connection ? connection.status : null,
        connectionId: connection ? connection._id : null,
        iRequested: connection
          ? connection.requester.toString() === req.user._id.toString()
          : false,
      };
    });

    res.json({ users: usersWithStatus });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── SEND CONNECTION REQUEST ──────────────────────────────────────────────────
// POST /api/connections/request/:userId
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const recipientId = req.params.userId;

    // Can't connect with yourself
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    // Check if connection already exists in either direction
    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const connection = new Connection({
      requester: req.user._id,
      recipient: recipientId,
    });

    await connection.save();

    res.status(201).json({ message: 'Connection request sent', connection });
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ACCEPT CONNECTION REQUEST ────────────────────────────────────────────────
// PUT /api/connections/accept/:connectionId
router.put('/accept/:connectionId', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Only the RECIPIENT can accept - not the person who sent it
    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    connection.status = 'accepted';
    await connection.save();

    res.json({ message: 'Connection accepted', connection });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET MY CONNECTIONS (accepted only) ──────────────────────────────────────
// GET /api/connections/my
router.get('/my', auth, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id },
      ],
      status: 'accepted',
    })
      .populate('requester', 'name email bio skills')
      .populate('recipient', 'name email bio skills');

    // Return the OTHER person in each connection (not the current user)
    const people = connections.map((c) => {
      const isRequester = c.requester._id.toString() === req.user._id.toString();
      return isRequester ? c.recipient : c.requester;
    });

    res.json({ connections: people });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET PENDING REQUESTS (sent to me) ───────────────────────────────────────
// GET /api/connections/pending
router.get('/pending', auth, async (req, res) => {
  try {
    const pending = await Connection.find({
      recipient: req.user._id,
      status: 'pending',
    }).populate('requester', 'name email bio skills');

    res.json({ pending });
  } catch (error) {
    console.error('Get pending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
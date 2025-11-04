import express from 'express';
import { Message } from '../models/index.js';

const router = express.Router();

// Get messages between current user and another user - Now using MongoDB
router.get('/:candidateId', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { candidateId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: candidateId },
        { senderId: candidateId, recipientId: userId }
      ]
    })
    .populate('senderId', 'name email')
    .populate('recipientId', 'name email')
    .sort({ sentAt: 1 })
    .lean();

    // Transform for frontend compatibility
    const transformedMessages = messages.map(msg => ({
      sender: msg.senderId?._id?.toString() === userId ? 'recruiter' : candidateId,
      text: msg.content,
      time: new Date(msg.sentAt).toLocaleTimeString(),
      ...msg
    }));

    res.json(transformedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message - Now using MongoDB
router.post('/:candidateId', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { candidateId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const message = await Message.create({
      messageId: `MSG-${Date.now()}`,
      senderId: userId,
      recipientId: candidateId,
      content: text,
      sentAt: new Date(),
      isRead: false
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name email')
      .populate('recipientId', 'name email')
      .lean();

    res.json({
      sender: 'recruiter',
      text: populated.content,
      time: new Date(populated.sentAt).toLocaleTimeString(),
      ...populated
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;



import express from 'express';
import { Message } from '../models/index.js';

const router = express.Router();

// Get unique contacts (users) that the current user has chatted with
router.get('/contacts', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    
    // Find all messages involving the user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    })
    .populate('senderId', 'name email')
    .populate('recipientId', 'name email')
    .lean();
    
    // Extract unique contacts
    const contactsMap = new Map();
    
    messages.forEach(msg => {
      let contact = null;
      if (msg.senderId && msg.senderId._id.toString() !== userId) {
        contact = msg.senderId;
      } else if (msg.recipientId && msg.recipientId._id.toString() !== userId) {
        contact = msg.recipientId;
      }
      
      if (contact && !contactsMap.has(contact._id.toString())) {
        contactsMap.set(contact._id.toString(), {
          id: contact._id.toString(),
          name: contact.name,
          email: contact.email
        });
      }
    });

    res.json(Array.from(contactsMap.values()));
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get messages between current user and another user
router.get('/:otherId', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { otherId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: otherId },
        { senderId: otherId, recipientId: userId }
      ]
    })
    .populate('senderId', 'name email')
    .populate('recipientId', 'name email')
    .sort({ sentAt: 1 })
    .lean();

    // Transform for frontend compatibility
    const transformedMessages = messages.map(msg => ({
      sender: msg.senderId?._id?.toString() === userId ? 'me' : 'them',
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

// Send a message
router.post('/:otherId', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { otherId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Must retrieve User docs to satisfy Message Schema required fields
    const { User } = await import('../models/index.js');
    const sender = await User.findById(userId).lean();
    const recipient = await User.findById(otherId).lean();

    const conversationId = [userId.toString(), otherId.toString()].sort().join('_');

    const message = await Message.create({
      messageId: `MSG-${Date.now()}`,
      conversationId,
      senderId: userId,
      senderName: sender ? sender.name : 'User',
      recipientId: otherId,
      recipientName: recipient ? recipient.name : 'User',
      content: text,
      sentAt: new Date(),
      isRead: false
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name email')
      .populate('recipientId', 'name email')
      .lean();

    res.json({
      sender: 'me',
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



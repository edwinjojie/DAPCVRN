import express from 'express';
import { Notification } from '../models/index.js';

const router = express.Router();

// Get notifications for current user - Now using MongoDB
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Transform for frontend compatibility
    const transformedNotifications = notifications.map(notif => ({
      id: notif._id.toString(),
      message: notif.message,
      time: new Date(notif.createdAt).toLocaleTimeString(),
      read: notif.isRead,
      ...notif
    }));

    res.json(transformedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read - Now using MongoDB
router.post('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;



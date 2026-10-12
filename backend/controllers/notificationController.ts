import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const notifs = dbStore.notifications.filter(n => n.userId === userId);
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifs.filter(n => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      data: notifs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const notif = dbStore.notifications.find(n => n._id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
    }
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    dbStore.notifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

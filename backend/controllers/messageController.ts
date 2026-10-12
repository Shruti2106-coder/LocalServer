import { Response } from 'express';
import { dbStore, IMessage } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const getMessagesByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    const booking = dbStore.bookings.find(b => b._id === bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Only customer or provider or admin can view chat
    if (userRole !== 'admin' && booking.customerId !== userId && booking.providerId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied to this booking chat.' });
      return;
    }

    const messages = dbStore.messages.filter(m => m.bookingId === bookingId);
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Mark messages directed to this user as read
    messages.forEach(m => {
      if (m.receiverId === userId) {
        m.isRead = true;
      }
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;
    const senderId = req.user?._id;
    const senderRole = req.user?.role || 'customer';
    const senderName = req.user?.name || 'User';

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: 'Message text is required.' });
      return;
    }

    const booking = dbStore.bookings.find(b => b._id === bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (booking.customerId !== senderId && booking.providerId !== senderId) {
      res.status(403).json({ success: false, message: 'You are not part of this booking.' });
      return;
    }

    const receiverId = senderId === booking.customerId ? booking.providerId : booking.customerId;

    const newMsg: IMessage = {
      _id: 'msg_' + Date.now(),
      bookingId,
      senderId: senderId || '',
      senderName,
      senderRole,
      receiverId,
      text: text.trim(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    dbStore.messages.push(newMsg);

    // Send notification to receiver
    dbStore.notifications.push({
      _id: 'notif_' + Date.now(),
      userId: receiverId,
      title: `New message from ${senderName}`,
      message: text.substring(0, 60),
      type: 'chat_message',
      isRead: false,
      link: `/chat/${bookingId}`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      data: newMsg
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

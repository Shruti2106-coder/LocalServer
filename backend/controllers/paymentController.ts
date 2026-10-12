import { Request, Response } from 'express';
import { dbStore, IPayment } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?._id;
    const { bookingId, amount, method } = req.body;

    if (!bookingId || !amount) {
      res.status(400).json({ success: false, message: 'Booking ID and amount are required.' });
      return;
    }

    const booking = dbStore.bookings.find(b => b._id === bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Payment simulation (Razorpay / UPI / Card gateway simulation)
    const transactionId = 'RPAY_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const newPayment: IPayment = {
      _id: 'pay_' + Date.now(),
      bookingId,
      customerId: customerId || booking.customerId,
      providerId: booking.providerId,
      amount: Number(amount),
      method: method || 'upi',
      transactionId,
      status: 'paid',
      createdAt: new Date().toISOString()
    };

    dbStore.payments.push(newPayment);
    booking.paymentStatus = 'paid';
    booking.paymentMethod = method || 'online';

    // Notification to provider
    dbStore.notifications.push({
      _id: 'notif_' + Date.now(),
      userId: booking.providerId,
      title: 'Payment Received',
      message: `Payment of ₹${amount} received for booking #${booking._id.substring(3)}.`,
      type: 'payment_received',
      isRead: false,
      link: '/provider/earnings',
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Payment processed successfully.',
      data: newPayment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const payment = dbStore.payments.find(p => p.bookingId === bookingId);
    res.json({
      success: true,
      data: payment || null
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

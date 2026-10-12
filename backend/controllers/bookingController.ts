import { Request, Response } from 'express';
import { dbStore, IBooking } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?._id;
    if (!customerId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const {
      providerId,
      serviceName,
      category,
      date,
      timeSlot,
      address,
      city,
      price,
      notes,
      paymentMethod = 'cash'
    } = req.body;

    if (!providerId || !serviceName || !date || !timeSlot || !address || price === undefined) {
      res.status(400).json({ success: false, message: 'Missing required booking fields.' });
      return;
    }

    // Check for double booking conflict for this provider at this date and slot
    const conflict = dbStore.bookings.find(b =>
      b.providerId === providerId &&
      b.date === date &&
      b.timeSlot === timeSlot &&
      ['confirmed', 'on_the_way', 'in_progress'].includes(b.status)
    );

    if (conflict) {
      res.status(409).json({
        success: false,
        message: 'This provider is already booked for this time slot. Please select a different time slot or date.'
      });
      return;
    }

    const customer = dbStore.users.find(u => u._id === customerId);
    const providerUser = dbStore.users.find(u => u._id === providerId);
    const providerProfile = dbStore.providerProfiles.find(p => p.userId === providerId);

    const bookingId = 'bk_' + Date.now();
    const newBooking: IBooking = {
      _id: bookingId,
      customerId,
      customerName: customer?.name || 'Valued Customer',
      customerPhone: customer?.phone || '',
      providerId,
      providerName: providerProfile?.businessName || providerUser?.name || 'Local Provider',
      providerPhone: providerUser?.phone || '',
      serviceName,
      category: category || providerProfile?.category || 'General',
      date,
      timeSlot,
      address,
      city: city || customer?.city || 'Mumbai',
      price: Number(price),
      notes: notes || '',
      status: 'pending',
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      paymentMethod,
      createdAt: new Date().toISOString(),
      hasReviewed: false
    };

    dbStore.bookings.push(newBooking);

    // If online payment was chosen, record the payment transaction
    if (paymentMethod === 'online' || paymentMethod === 'upi' || paymentMethod === 'card') {
      dbStore.payments.push({
        _id: 'pay_' + Date.now(),
        bookingId: newBooking._id,
        customerId,
        providerId,
        amount: Number(price),
        method: (paymentMethod === 'card' ? 'card' : 'upi'),
        transactionId: 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: 'paid',
        createdAt: new Date().toISOString()
      });
    }

    // Notify provider of new booking request
    dbStore.notifications.push({
      _id: 'notif_' + Date.now(),
      userId: providerId,
      title: 'New Booking Request',
      message: `${customer?.name || 'A customer'} requested ${serviceName} for ${date} at ${timeSlot}.`,
      type: 'new_booking',
      isRead: false,
      link: '/provider/bookings',
      createdAt: new Date().toISOString()
    });

    // Notify customer
    dbStore.notifications.push({
      _id: 'notif_' + (Date.now() + 1),
      userId: customerId,
      title: 'Booking Placed Successfully',
      message: `Your request for ${serviceName} is submitted to ${newBooking.providerName}. Status: Pending Confirmation.`,
      type: 'booking_created',
      isRead: false,
      link: '/customer/bookings',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: newBooking
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?._id;
    const { status } = req.query;

    let list = dbStore.bookings.filter(b => b.customerId === customerId);
    if (status && status !== 'all') {
      list = list.filter(b => b.status === status);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: list
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProviderBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const providerId = req.user?._id;
    const { status } = req.query;

    let list = dbStore.bookings.filter(b => b.providerId === providerId);
    if (status && status !== 'all') {
      list = list.filter(b => b.status === status);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: list
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = dbStore.bookings.find(b => b._id === id);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (userRole !== 'admin' && booking.customerId !== userId && booking.providerId !== userId) {
      res.status(403).json({ success: false, message: 'You are not authorized to view this booking.' });
      return;
    }

    const messages = dbStore.messages.filter(m => m.bookingId === id);
    const payment = dbStore.payments.find(p => p.bookingId === id);

    res.json({
      success: true,
      data: {
        ...booking,
        messages,
        payment
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const booking = dbStore.bookings.find(b => b._id === id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const userId = req.user?._id;
    const userRole = req.user?.role;

    // Permissions:
    // Providers can accept (confirmed), reject, set on_the_way, in_progress, completed
    // Customers can cancel pending/confirmed bookings
    // Admins can update any
    if (userRole === 'provider' && booking.providerId !== userId) {
      res.status(403).json({ success: false, message: 'Not authorized for this booking.' });
      return;
    }

    if (userRole === 'customer' && booking.customerId !== userId) {
      res.status(403).json({ success: false, message: 'Not authorized for this booking.' });
      return;
    }

    booking.status = status;
    if (reason) {
      booking.cancellationReason = reason;
    }

    // If marked completed and payment was pending with cash, customer or provider can mark payment paid
    if (status === 'completed' && booking.paymentMethod === 'cash') {
      booking.paymentStatus = 'paid';
    }

    // Generate notifications
    let notifTitle = 'Booking Status Updated';
    let notifMsg = `Your booking for ${booking.serviceName} is now ${status}.`;

    if (status === 'confirmed') {
      notifTitle = 'Booking Accepted!';
      notifMsg = `${booking.providerName} has confirmed your service for ${booking.date} at ${booking.timeSlot}.`;
    } else if (status === 'on_the_way') {
      notifTitle = 'Provider On The Way!';
      notifMsg = `${booking.providerName} has departed and is heading to your address.`;
    } else if (status === 'in_progress') {
      notifTitle = 'Service In Progress';
      notifMsg = `${booking.providerName} has started working on ${booking.serviceName}.`;
    } else if (status === 'completed') {
      notifTitle = 'Service Completed!';
      notifMsg = `${booking.providerName} finished the service. Please leave a review to share your experience!`;
    } else if (status === 'rejected') {
      notifTitle = 'Booking Declined';
      notifMsg = `${booking.providerName} was unable to accept this request. Please try another provider.`;
    } else if (status === 'cancelled') {
      notifTitle = 'Booking Cancelled';
      notifMsg = `The booking was cancelled.${reason ? ` Reason: ${reason}` : ''}`;
    }

    // Send notification to customer if provider changed status
    if (userRole === 'provider' || userRole === 'admin') {
      dbStore.notifications.push({
        _id: 'notif_' + Date.now(),
        userId: booking.customerId,
        title: notifTitle,
        message: notifMsg,
        type: `booking_${status}`,
        isRead: false,
        link: '/customer/bookings',
        createdAt: new Date().toISOString()
      });
    }

    // Send notification to provider if customer cancelled
    if (userRole === 'customer') {
      dbStore.notifications.push({
        _id: 'notif_' + Date.now(),
        userId: booking.providerId,
        title: 'Booking Cancelled by Customer',
        message: `${booking.customerName} cancelled booking #${booking._id.substring(3)}.`,
        type: 'booking_cancelled',
        isRead: false,
        link: '/provider/bookings',
        createdAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: booking
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { Request, Response } from 'express';
import { dbStore, IReview } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?._id;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Booking ID, rating (1-5), and comment are required.' });
      return;
    }

    const booking = dbStore.bookings.find(b => b._id === bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (booking.customerId !== customerId) {
      res.status(403).json({ success: false, message: 'You can only review bookings made by yourself.' });
      return;
    }

    if (booking.status !== 'completed') {
      res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed services.' });
      return;
    }

    // Check if already reviewed
    const existing = dbStore.reviews.find(r => r.bookingId === bookingId);
    if (existing) {
      res.status(400).json({ success: false, message: 'You have already reviewed this booking.' });
      return;
    }

    const customer = dbStore.users.find(u => u._id === customerId);
    const reviewId = 'rev_' + Date.now();
    const newReview: IReview = {
      _id: reviewId,
      bookingId,
      customerId: customerId || '',
      customerName: customer?.name || 'Customer',
      providerId: booking.providerId,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    dbStore.reviews.push(newReview);
    booking.hasReviewed = true;

    // Recalculate provider average rating and count
    const providerReviews = dbStore.reviews.filter(r => r.providerId === booking.providerId);
    const totalRating = providerReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / providerReviews.length).toFixed(1));

    const providerProfile = dbStore.providerProfiles.find(p => p.userId === booking.providerId);
    if (providerProfile) {
      providerProfile.rating = avgRating;
      providerProfile.reviewCount = providerReviews.length;
    }

    // Send notification to provider
    dbStore.notifications.push({
      _id: 'notif_' + Date.now(),
      userId: booking.providerId,
      title: 'New Customer Review',
      message: `${newReview.customerName} gave you a ${rating}-star rating: "${comment.substring(0, 60)}..."`,
      type: 'new_review',
      isRead: false,
      link: '/provider/reviews',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: newReview
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const reviews = dbStore.reviews.filter(r => r.providerId === providerId);
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate rating breakdown
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
    });

    const averageRating = reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 5.0;

    res.json({
      success: true,
      total: reviews.length,
      averageRating,
      distribution,
      data: reviews
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

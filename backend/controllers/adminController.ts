import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = dbStore.users.length;
    const customers = dbStore.users.filter(u => u.role === 'customer').length;
    const providers = dbStore.users.filter(u => u.role === 'provider').length;

    const totalBookings = dbStore.bookings.length;
    const completedBookings = dbStore.bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = dbStore.bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;
    const pendingBookings = dbStore.bookings.filter(b => b.status === 'pending').length;
    const activeBookings = dbStore.bookings.filter(b => ['confirmed', 'on_the_way', 'in_progress'].includes(b.status)).length;

    const totalRevenue = dbStore.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingVerifications = dbStore.providerProfiles.filter(p => !p.isVerified).length;
    const verifiedProviders = dbStore.providerProfiles.filter(p => p.isVerified).length;

    const totalReviews = dbStore.reviews.length;
    const averageRating = totalReviews > 0
      ? Number((dbStore.reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

    const openComplaints = dbStore.complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    dbStore.bookings.forEach(b => {
      const cat = b.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        customers,
        providers,
        verifiedProviders,
        pendingVerifications,
        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        activeBookings,
        totalRevenue,
        platformFeeEstimated: Math.round(totalRevenue * 0.1), // 10% platform commission
        totalReviews,
        averageRating,
        openComplaints,
        categoryCounts
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = dbStore.users.map(u => {
      const providerProfile = u.role === 'provider' ? dbStore.providerProfiles.find(p => p.userId === u._id) : null;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        avatar: u.avatar,
        city: u.city,
        isActive: u.isActive,
        createdAt: u.createdAt,
        providerProfile
      };
    });

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = dbStore.users.find(u => u._id === id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts.' });
      return;
    }

    user.isActive = !user.isActive;

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { _id: user._id, isActive: user.isActive }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // provider profile id or userId
    const profile = dbStore.providerProfiles.find(p => p._id === id || p.userId === id);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const { verify = true } = req.body;
    profile.isVerified = Boolean(verify);

    // Notify provider
    dbStore.notifications.push({
      _id: 'notif_' + Date.now(),
      userId: profile.userId,
      title: profile.isVerified ? 'Profile Verified!' : 'Verification Status Updated',
      message: profile.isVerified
        ? 'Congratulations! Your provider profile is now officially verified with the verified badge.'
        : 'Your verified badge has been revoked. Please check your credentials.',
      type: 'provider_verified',
      isRead: false,
      link: '/provider/profile',
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Provider profile ${profile.isVerified ? 'verified' : 'unverified'} successfully.`,
      data: profile
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = [...dbStore.bookings];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

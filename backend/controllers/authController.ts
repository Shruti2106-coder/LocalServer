import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore, IUser, IProviderProfile } from '../db/store.js';
import { config } from '../config/config.js';
import { AuthRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role, city, address, category, businessName } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    if (role === 'admin') {
      res.status(400).json({ success: false, message: 'Cannot register directly as administrator.' });
      return;
    }

    const existing = dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Date.now();
    const assignedRole = role === 'provider' ? 'provider' : 'customer';

    const newUser: IUser = {
      _id: userId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      passwordHash,
      role: assignedRole,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=a8b88a`,
      city: city || 'Mumbai',
      address: address || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    dbStore.users.push(newUser);

    let profile: IProviderProfile | null = null;
    if (assignedRole === 'provider') {
      profile = {
        _id: 'prof_' + Date.now(),
        userId: newUser._id,
        businessName: businessName || `${name}'s Services`,
        category: category || 'Plumbing',
        bio: `Professional ${category || 'service'} provider based in ${city || 'Mumbai'}. Committed to dependable, on-time craftsmanship.`,
        experienceYears: 2,
        hourlyRate: 399,
        rating: 5.0,
        reviewCount: 0,
        isVerified: false, // New providers await admin verification!
        availabilityStatus: 'available',
        workingHours: '9:00 AM - 7:00 PM',
        serviceArea: city || 'Mumbai Central',
        city: city || 'Mumbai',
        services: [
          {
            name: `Standard ${category || 'General'} Service`,
            description: `Comprehensive inspection and repair service for ${category || 'general home needs'}.`,
            price: 399,
            estimatedDuration: '1 hour'
          }
        ]
      };
      dbStore.providerProfiles.push(profile);
    }

    const token = jwt.sign(
      { _id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Welcome notification
    dbStore.notifications.push({
      _id: 'notif_' + Date.now(),
      userId: newUser._id,
      title: 'Welcome to LocalServe!',
      message: assignedRole === 'provider'
        ? 'Your provider account has been created. An administrator will verify your profile shortly.'
        : 'Welcome! Discover trusted local professionals and book services easily.',
      type: 'system',
      isRead: false,
      link: assignedRole === 'provider' ? '/provider/profile' : '/services',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        city: newUser.city,
        address: newUser.address
      },
      providerProfile: profile
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = dbStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const providerProfile = dbStore.providerProfiles.find(p => p.userId === user._id) || null;

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        city: user.city,
        address: user.address
      },
      providerProfile
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized.' });
      return;
    }

    const user = dbStore.users.find(u => u._id === req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const providerProfile = dbStore.providerProfiles.find(p => p.userId === user._id) || null;

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        city: user.city,
        address: user.address,
        isActive: user.isActive
      },
      providerProfile
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role = 'customer' } = req.body;
    let targetUser: IUser | undefined;

    if (role === 'admin') {
      targetUser = dbStore.users.find(u => u.role === 'admin');
    } else if (role === 'provider') {
      targetUser = dbStore.users.find(u => u.role === 'provider' && u._id === 'usr_prov_1') || dbStore.users.find(u => u.role === 'provider');
    } else {
      targetUser = dbStore.users.find(u => u.role === 'customer' && u._id === 'usr_cust_1') || dbStore.users.find(u => u.role === 'customer');
    }

    if (!targetUser) {
      res.status(404).json({ success: false, message: `No demo account found for ${role}.` });
      return;
    }

    const token = jwt.sign(
      { _id: targetUser._id, email: targetUser.email, role: targetUser.role, name: targetUser.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const providerProfile = dbStore.providerProfiles.find(p => p.userId === targetUser?._id) || null;

    res.json({
      success: true,
      token,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        role: targetUser.role,
        avatar: targetUser.avatar,
        city: targetUser.city,
        address: targetUser.address
      },
      providerProfile
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = dbStore.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) {
    res.status(404).json({ success: false, message: 'No account found with this email address.' });
    return;
  }
  res.json({
    success: true,
    message: `Password reset instructions and verification code sent to ${email}. (Demo reset code: 123456)`
  });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, code, newPassword } = req.body;
  const user = dbStore.users.find(u => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }
  if (code !== '123456') {
    res.status(400).json({ success: false, message: 'Invalid reset code. For demo, use 123456.' });
    return;
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  res.json({ success: true, message: 'Password has been successfully updated. You can now login.' });
};

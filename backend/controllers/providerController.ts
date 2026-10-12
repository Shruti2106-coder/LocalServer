import { Request, Response } from 'express';
import { dbStore, IProviderProfile } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      location,
      minRating,
      maxPrice,
      availability,
      verifiedOnly,
      sortBy
    } = req.query;

    let results = dbStore.providerProfiles.map(profile => {
      const user = dbStore.users.find(u => u._id === profile.userId);
      return {
        ...profile,
        providerName: user ? user.name : profile.businessName,
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        email: user?.email,
        phone: user?.phone
      };
    });

    // Category filter
    if (category && category !== 'all') {
      const catLower = String(category).toLowerCase();
      results = results.filter(p => p.category.toLowerCase().includes(catLower));
    }

    // Search query (name, category, services, bio)
    if (search) {
      const query = String(search).toLowerCase();
      results = results.filter(p => {
        const matchesName = p.providerName.toLowerCase().includes(query) || p.businessName.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesBio = p.bio.toLowerCase().includes(query);
        const matchesServices = p.services.some(s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query));
        return matchesName || matchesCategory || matchesBio || matchesServices;
      });
    }

    // Location / city / area filter
    if (location && String(location).trim() !== '') {
      const loc = String(location).toLowerCase();
      results = results.filter(p =>
        p.city.toLowerCase().includes(loc) ||
        p.serviceArea.toLowerCase().includes(loc)
      );
    }

    // Rating filter
    if (minRating) {
      const minR = parseFloat(String(minRating));
      results = results.filter(p => p.rating >= minR);
    }

    // Max Price filter
    if (maxPrice) {
      const maxP = parseFloat(String(maxPrice));
      results = results.filter(p => p.hourlyRate <= maxP);
    }

    // Availability filter
    if (availability && availability !== 'all') {
      results = results.filter(p => p.availabilityStatus === availability);
    }

    // Verified only filter
    if (verifiedOnly === 'true') {
      results = results.filter(p => p.isVerified);
    }

    // Sorting
    if (sortBy === 'rating_desc') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_asc') {
      results.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => b.hourlyRate - a.hourlyRate);
    } else if (sortBy === 'reviews_desc') {
      results.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === 'experience_desc') {
      results.sort((a, b) => b.experienceYears - a.experienceYears);
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProviderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = dbStore.providerProfiles.find(p => p._id === id || p.userId === id);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider not found.' });
      return;
    }

    const user = dbStore.users.find(u => u._id === profile.userId);
    const reviews = dbStore.reviews.filter(r => r.providerId === profile.userId);

    res.json({
      success: true,
      data: {
        ...profile,
        providerName: user ? user.name : profile.businessName,
        avatar: user?.avatar,
        email: user?.email,
        phone: user?.phone,
        reviews
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const profile = dbStore.providerProfiles.find(p => p.userId === userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const {
      businessName,
      category,
      bio,
      experienceYears,
      hourlyRate,
      availabilityStatus,
      workingHours,
      serviceArea,
      city
    } = req.body;

    if (businessName) profile.businessName = businessName;
    if (category) profile.category = category;
    if (bio !== undefined) profile.bio = bio;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (hourlyRate !== undefined) profile.hourlyRate = Number(hourlyRate);
    if (availabilityStatus) profile.availabilityStatus = availabilityStatus;
    if (workingHours) profile.workingHours = workingHours;
    if (serviceArea) profile.serviceArea = serviceArea;
    if (city) profile.city = city;

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProviderService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const profile = dbStore.providerProfiles.find(p => p.userId === userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Provider profile not found.' });
      return;
    }

    const { name, description, price, estimatedDuration } = req.body;
    if (!name || !price) {
      res.status(400).json({ success: false, message: 'Service name and price are required.' });
      return;
    }

    const newService = {
      name,
      description: description || '',
      price: Number(price),
      estimatedDuration: estimatedDuration || '1 hour'
    };

    profile.services.push(newService);

    res.status(201).json({
      success: true,
      message: 'Service added successfully.',
      data: profile.services
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProviderService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { index } = req.params;
    const serviceIndex = parseInt(index, 10);
    const profile = dbStore.providerProfiles.find(p => p.userId === userId);
    if (!profile || !profile.services[serviceIndex]) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    const { name, description, price, estimatedDuration } = req.body;
    if (name) profile.services[serviceIndex].name = name;
    if (description !== undefined) profile.services[serviceIndex].description = description;
    if (price !== undefined) profile.services[serviceIndex].price = Number(price);
    if (estimatedDuration) profile.services[serviceIndex].estimatedDuration = estimatedDuration;

    res.json({
      success: true,
      message: 'Service updated successfully.',
      data: profile.services
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProviderService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { index } = req.params;
    const serviceIndex = parseInt(index, 10);
    const profile = dbStore.providerProfiles.find(p => p.userId === userId);
    if (!profile || !profile.services[serviceIndex]) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    profile.services.splice(serviceIndex, 1);

    res.json({
      success: true,
      message: 'Service deleted successfully.',
      data: profile.services
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

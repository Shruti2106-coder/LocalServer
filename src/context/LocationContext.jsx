import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const LocationContext = createContext();

const STORAGE_KEY = 'localserve_location';
const DISMISS_KEY = 'localserve_loc_banner_dismissed';

export const LocationProvider = ({ children }) => {
  // Load initial saved location from localStorage if available
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Location status: 'idle' | 'detecting' | 'granted' | 'denied' | 'timeout' | 'unavailable' | 'error'
  const [status, setStatus] = useState('idle');
  const [errorDetails, setErrorDetails] = useState(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Perform reverse geocoding via server API or local fallback
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await api.get(`/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend geocode endpoint error, using client coordinates:', err);
    }

    // Client fallback if server request fails
    return {
      latitude: lat,
      longitude: lng,
      city: 'Mumbai',
      area: '',
      formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      state: 'Maharashtra',
      country: 'India'
    };
  };

  // Request location using the browser's native Geolocation API
  const requestLocation = useCallback(async (options = {}) => {
    const { isRetry = false } = options;

    if (!navigator.geolocation) {
      setStatus('unavailable');
      setErrorDetails('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('detecting');
    setErrorDetails(null);
    if (isRetry) {
      setIsBannerDismissed(false);
      try {
        sessionStorage.removeItem(DISMISS_KEY);
      } catch {}
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geoData = await reverseGeocode(latitude, longitude);
          const fullLocation = {
            latitude,
            longitude,
            city: geoData.city || 'Mumbai',
            area: geoData.area || '',
            formattedAddress: geoData.formattedAddress || `${geoData.city || 'Mumbai'}`,
            state: geoData.state || '',
            country: geoData.country || 'India',
            source: 'geolocation',
            timestamp: Date.now()
          };

          setLocation(fullLocation);
          setStatus('granted');
          setErrorDetails(null);

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fullLocation));
          } catch (e) {
            console.error('Failed to persist location:', e);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          const fallbackLoc = {
            latitude,
            longitude,
            city: 'Mumbai',
            area: '',
            formattedAddress: 'Mumbai, Maharashtra',
            state: 'Maharashtra',
            country: 'India',
            source: 'geolocation',
            timestamp: Date.now()
          };
          setLocation(fallbackLoc);
          setStatus('granted');
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackLoc));
          } catch {}
        }
      },
      (error) => {
        console.warn('Geolocation permission or detection error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorDetails('Permission denied');
        } else if (error.code === error.TIMEOUT) {
          setStatus('timeout');
          setErrorDetails('Location request timed out');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus('unavailable');
          setErrorDetails('Position unavailable');
        } else {
          setStatus('error');
          setErrorDetails(error.message || 'An error occurred while retrieving location');
        }
      },
      geoOptions
    );
  }, []);

  // Set manual location entered by the user
  const setManualLocation = useCallback((cityName, areaName = '') => {
    if (!cityName || !cityName.trim()) return;

    const trimmedCity = cityName.trim();
    const trimmedArea = areaName ? areaName.trim() : '';

    const newLoc = {
      city: trimmedCity,
      area: trimmedArea,
      formattedAddress: trimmedArea ? `${trimmedArea}, ${trimmedCity}` : trimmedCity,
      source: 'manual',
      timestamp: Date.now()
    };

    setLocation(newLoc);
    setStatus('granted');
    setErrorDetails(null);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLoc));
    } catch (e) {
      console.error('Failed to persist manual location:', e);
    }
  }, []);

  // Clear location
  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  // Dismiss denied/error banner for this session
  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    } catch {}
  }, []);

  // Automatic location request canceled as per user preference
  // User can still select city manually or explicitly click detect if needed
  useEffect(() => {
    // No automatic popup/request on site load
  }, []);

  const value = {
    location,
    city: location?.city || '',
    area: location?.area || '',
    formattedAddress: location?.formattedAddress || '',
    status,
    isLoading: status === 'detecting',
    isDenied: status === 'denied',
    isError: status === 'denied' || status === 'timeout' || status === 'unavailable' || status === 'error',
    errorDetails,
    isBannerVisible: !isBannerDismissed && (status === 'denied' || status === 'timeout' || status === 'unavailable'),
    requestLocation,
    setManualLocation,
    clearLocation,
    dismissBanner
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

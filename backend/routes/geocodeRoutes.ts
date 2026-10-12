import { Router, Request, Response } from 'express';

const router = Router();

// Major cities for coordinate proximity fallback
const KNOWN_CITIES = [
  { city: 'Mumbai', area: 'South Mumbai', lat: 18.922, lng: 72.834, state: 'Maharashtra' },
  { city: 'Mumbai', area: 'Bandra West', lat: 19.059, lng: 72.829, state: 'Maharashtra' },
  { city: 'Mumbai', area: 'Andheri West', lat: 19.113, lng: 72.826, state: 'Maharashtra' },
  { city: 'Mumbai', area: 'Powai', lat: 19.117, lng: 72.905, state: 'Maharashtra' },
  { city: 'Thane', area: 'Thane West', lat: 19.218, lng: 72.978, state: 'Maharashtra' },
  { city: 'Navi Mumbai', area: 'Vashi', lat: 19.077, lng: 72.998, state: 'Maharashtra' },
  { city: 'Pune', area: 'Shivajinagar', lat: 18.531, lng: 73.844, state: 'Maharashtra' },
  { city: 'Pune', area: 'Kothrud', lat: 18.507, lng: 73.807, state: 'Maharashtra' },
  { city: 'Delhi', area: 'Connaught Place', lat: 28.631, lng: 77.216, state: 'Delhi' },
  { city: 'Noida', area: 'Sector 18', lat: 28.570, lng: 77.321, state: 'Uttar Pradesh' },
  { city: 'Gurugram', area: 'Cyber City', lat: 28.495, lng: 77.089, state: 'Haryana' },
  { city: 'Bengaluru', area: 'Indiranagar', lat: 12.978, lng: 77.640, state: 'Karnataka' },
  { city: 'Bengaluru', area: 'Koramangala', lat: 12.935, lng: 77.624, state: 'Karnataka' },
  { city: 'Hyderabad', area: 'Hitec City', lat: 17.443, lng: 78.377, state: 'Telangana' },
  { city: 'Chennai', area: 'T Nagar', lat: 13.041, lng: 80.233, state: 'Tamil Nadu' },
  { city: 'Kolkata', area: 'Salt Lake', lat: 22.586, lng: 88.417, state: 'West Bengal' },
  { city: 'Ahmedabad', area: 'Navrangpura', lat: 23.037, lng: 72.561, state: 'Gujarat' }
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findClosestCity(lat: number, lng: number) {
  let closest = KNOWN_CITIES[0];
  let minDistance = calculateDistance(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < KNOWN_CITIES.length; i++) {
    const d = calculateDistance(lat, lng, KNOWN_CITIES[i].lat, KNOWN_CITIES[i].lng);
    if (d < minDistance) {
      minDistance = d;
      closest = KNOWN_CITIES[i];
    }
  }

  return { closest, distance: minDistance };
}

router.get('/reverse', async (req: Request, res: Response): Promise<void> => {
  const latStr = req.query.lat as string;
  const lngStr = req.query.lng as string;

  if (!latStr || !lngStr) {
    res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    return;
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ success: false, message: 'Invalid coordinates' });
    return;
  }

  let detectedData: {
    city: string;
    area: string;
    formattedAddress: string;
    state: string;
    country: string;
  } | null = null;

  // 1. Try BigDataCloud reverse geocode client API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const city = bdcData.city || bdcData.locality || bdcData.principalSubdivision || '';
      const area = bdcData.localityInfo?.administrative?.[3]?.name || bdcData.locality || '';
      const state = bdcData.principalSubdivision || '';
      const country = bdcData.countryName || 'India';

      if (city) {
        detectedData = {
          city,
          area: area && area !== city ? area : '',
          formattedAddress: [area, city, state, country].filter(Boolean).join(', '),
          state,
          country
        };
      }
    }
  } catch (err) {
    // Continue to next fallback
  }

  // 2. Try OpenStreetMap Nominatim reverse geocoding if needed
  if (!detectedData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'LocalServe-Marketplace/1.0 (contact@localserve.com)'
          },
          signal: controller.signal
        }
      );
      clearTimeout(timeout);

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const addr = nomData.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || '';
        const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
        const state = addr.state || '';
        const country = addr.country || 'India';

        if (city) {
          detectedData = {
            city,
            area: area && area !== city ? area : '',
            formattedAddress: nomData.display_name || [area, city, state, country].filter(Boolean).join(', '),
            state,
            country
          };
        }
      }
    } catch (err) {
      // Continue to proximity fallback
    }
  }

  // 3. High-fidelity coordinate proximity fallback
  if (!detectedData) {
    const { closest, distance } = findClosestCity(lat, lng);
    if (distance <= 150) {
      detectedData = {
        city: closest.city,
        area: closest.area,
        formattedAddress: `${closest.area}, ${closest.city}, ${closest.state}`,
        state: closest.state,
        country: 'India'
      };
    } else {
      detectedData = {
        city: closest.city,
        area: closest.area,
        formattedAddress: `${closest.city}, ${closest.state}`,
        state: closest.state,
        country: 'India'
      };
    }
  }

  res.json({
    success: true,
    data: {
      latitude: lat,
      longitude: lng,
      ...detectedData
    }
  });
});

export default router;

import { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { dbStore } from '../db/store.js';

let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Fallback rule-based matching if Gemini API is temporarily unavailable
function fallbackRecommendation(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes('tap') || p.includes('leak') || p.includes('pipe') || p.includes('drain') || p.includes('flush') || p.includes('toilet') || p.includes('water heater') || p.includes('geyser') || p.includes('plumb')) {
    return {
      recommendedCategory: 'Plumbing',
      serviceTitle: 'Plumbing Inspection & Repair',
      reason: 'The problem involves water flow, leaking fixtures, or pipe drainage. A certified plumber is needed to prevent water damage.',
      confidence: 96,
      suggestedKeywords: ['leak repair', 'tap replacement', 'pipe clogging', 'drainage fix'],
      urgency: p.includes('leak') || p.includes('burst') ? 'high' : 'medium',
      estimatedPriceRange: '₹349 - ₹699',
      troubleshootingTip: 'Turn off the main water valve near your meter to halt ongoing water leakage until the technician arrives.'
    };
  }

  if (p.includes('light') || p.includes('switch') || p.includes('shock') || p.includes('mcb') || p.includes('trip') || p.includes('wire') || p.includes('fan') || p.includes('electric') || p.includes('power')) {
    return {
      recommendedCategory: 'Electrical',
      serviceTitle: 'Electrical Circuit & Fixture Repair',
      reason: 'The issue relates to home wiring, circuit breakers, or electrical appliances. Professional electrical servicing ensures fire and shock prevention.',
      confidence: 95,
      suggestedKeywords: ['short circuit', 'mcb tripping', 'switch replacement', 'fan repair'],
      urgency: p.includes('shock') || p.includes('spark') ? 'high' : 'medium',
      estimatedPriceRange: '₹299 - ₹599',
      troubleshootingTip: 'Do not touch exposed wires with wet hands. Turn off the individual room MCB switch before inspecting.'
    };
  }

  if (p.includes('clean') || p.includes('dust') || p.includes('stain') || p.includes('kitchen') || p.includes('bathroom') || p.includes('sofa') || p.includes('deep clean') || p.includes('sanitize')) {
    return {
      recommendedCategory: 'Cleaning',
      serviceTitle: 'Deep Sanitization & Cleaning',
      reason: 'The issue requires thorough sanitization, grease removal, or fabric shampooing using specialized industrial tools.',
      confidence: 94,
      suggestedKeywords: ['full home cleaning', 'kitchen degreasing', 'bathroom scrubbing', 'sofa shampoo'],
      urgency: 'medium',
      estimatedPriceRange: '₹699 - ₹2,499',
      troubleshootingTip: 'Keep the area well ventilated and ensure breakable items are stored safely prior to the cleaning team’s arrival.'
    };
  }

  if (p.includes('laptop') || p.includes('computer') || p.includes('boot') || p.includes('screen') || p.includes('windows') || p.includes('mac') || p.includes('ssd') || p.includes('virus') || p.includes('ram')) {
    return {
      recommendedCategory: 'Computer Repair',
      serviceTitle: 'Laptop & PC Diagnostics / Hardware Servicing',
      reason: 'The hardware or operating system appears to be unresponsive, corrupted, or thermally throttling. A computer technician is required.',
      confidence: 97,
      suggestedKeywords: ['no display', 'thermal paste', 'os reinstall', 'ssd upgrade'],
      urgency: 'medium',
      estimatedPriceRange: '₹499 - ₹899',
      troubleshootingTip: 'Disconnect external USB devices and chargers for 30 seconds, then hold down the power button for 15 seconds to release static charge.'
    };
  }

  if (p.includes('tutor') || p.includes('math') || p.includes('study') || p.includes('exam') || p.includes('physics') || p.includes('class') || p.includes('learn') || p.includes('school')) {
    return {
      recommendedCategory: 'Tutoring',
      serviceTitle: '1-on-1 Academic Coaching & Mentorship',
      reason: 'Student requires structured concept explanations, test series practice, or syllabus guidance in academic subjects.',
      confidence: 95,
      suggestedKeywords: ['math tutor', 'science coaching', 'cbse syllabus', 'exam prep'],
      urgency: 'low',
      estimatedPriceRange: '₹500 - ₹700 / hr',
      troubleshootingTip: 'List out the specific chapters or problem sets where you feel stuck to maximize the first session efficiency.'
    };
  }

  if (p.includes('car') || p.includes('bike') || p.includes('scooter') || p.includes('puncture') || p.includes('brake') || p.includes('engine') || p.includes('mechanic') || p.includes('battery jump')) {
    return {
      recommendedCategory: 'Mechanic',
      serviceTitle: 'Doorstep Vehicle Maintenance & Repair',
      reason: 'The symptoms involve automotive mechanical wear, battery depletion, or drivetrain diagnostics.',
      confidence: 93,
      suggestedKeywords: ['jumpstart', 'two-wheeler service', 'brake pad', 'oil change'],
      urgency: p.includes('puncture') || p.includes('battery') ? 'high' : 'medium',
      estimatedPriceRange: '₹399 - ₹799',
      troubleshootingTip: 'Park the vehicle on level ground away from oncoming traffic and engage the handbrake/main stand.'
    };
  }

  return {
    recommendedCategory: 'Plumbing',
    serviceTitle: 'General Home Maintenance Inspection',
    reason: 'Based on your description, an on-site technician can evaluate the exact root cause and provide an upfront quote.',
    confidence: 88,
    suggestedKeywords: ['inspection', 'doorstep technician', 'home repair'],
    urgency: 'medium',
    estimatedPriceRange: '₹399 - ₹599',
    troubleshootingTip: 'Take a clear photograph of the problematic area so the technician can arrive with the right spare parts.'
  };
}

export const getServiceRecommendation = async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({
      success: false,
      message: 'Please provide a description of the issue or requirement.'
    });
    return;
  }

  const userQuery = prompt.trim();
  let aiRecommendation: any = null;

  if (aiClient) {
    try {
      const systemInstruction = `You are LocalServe AI, an expert assistant on a local services marketplace.
Given a user's description of a home or everyday problem, recommend the exact service category from these available options:
['Plumbing', 'Electrical', 'Cleaning', 'Tutoring', 'Computer Repair', 'Mechanic', 'Carpentry', 'Painting', 'Appliance Repair', 'Gardening'].

Return ONLY valid JSON matching this structure:
{
  "recommendedCategory": string,
  "serviceTitle": string,
  "reason": string (clear explanation of why this service is required),
  "confidence": number (integer between 80 and 99),
  "suggestedKeywords": string[] (3-5 relevant search keywords),
  "urgency": "low" | "medium" | "high",
  "estimatedPriceRange": string (e.g. "₹399 - ₹799"),
  "troubleshootingTip": string (a quick, safe immediate safety or prep tip for the homeowner)
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userQuery,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        aiRecommendation = JSON.parse(responseText);
      }
    } catch (err: any) {
      console.warn('Gemini API call failed or encountered an error; using fallback:', err?.message || err);
      aiRecommendation = null;
    }
  }

  if (!aiRecommendation) {
    aiRecommendation = fallbackRecommendation(userQuery);
  }

  // Find matching providers in database
  const matchingCategory = aiRecommendation.recommendedCategory;
  const matchedProviders = dbStore.providerProfiles
    .filter(p => p.category.toLowerCase() === matchingCategory.toLowerCase())
    .map(p => {
      const user = dbStore.users.find(u => u._id === p.userId);
      return {
        _id: p._id,
        userId: p.userId,
        businessName: p.businessName,
        providerName: user?.name || p.businessName,
        rating: p.rating,
        reviewCount: p.reviewCount,
        hourlyRate: p.hourlyRate,
        avatar: user?.avatar,
        city: p.city,
        serviceArea: p.serviceArea,
        isVerified: p.isVerified,
        services: p.services
      };
    });

  res.json({
    success: true,
    data: {
      query: userQuery,
      recommendation: aiRecommendation,
      matchedProviders
    }
  });
};

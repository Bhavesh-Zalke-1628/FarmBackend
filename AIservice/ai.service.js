import { GoogleGenerativeAI } from "@google/generative-ai";


// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// Agricultural AI Model Configuration
const agriModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
    You are Krishi Mitra, an AI agricultural assistant for Maharashtra farmers. 
    Provide:
    1. Accurate weather forecasts in Marathi/English
    2. Crop-specific advice for sugarcane, soybean, cotton, chickpea, wheat etc.
    3. Practical farming recommendations
    4. Market price analysis
    5. Pest/disease warnings
    6. Fertilizer, pesticide, spray guidance
    Always respond in the user's preferred language.
    Output format must be simple, clean, and structured.
  `,
  generationConfig: {
    region: "us-central1"
  }
});

// Base function
export const getAgriculturalInsights = async (prompt, language = 'en') => {
  try {
    const result = await agriModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Service Error:", error);
    return language === 'mr'
      ? 'त्रुटी: कृपया पुन्हा प्रयत्न करा'
      : 'Error: Please try again (Limit Exceed)';
  }
};

// 1. Crop-Specific Forecast
export const getCropSpecificForecast = async (crop, location, language) => {
  const prompt = `Provide 7-day ${crop}-specific weather forecast for ${location} in ${language}. Include:
  - Daily weather summary
  - Temperature range
  - Rainfall chances
  - Impact on crop growth
  - Recommended actions for farmers`;

  return await getAgriculturalInsights(prompt, language);
};

// 2. Market Analysis
export const getMarketAnalysis = async (crop, language) => {
  const prompt = `Analyze current market trends for ${crop} in Maharashtra in ${language}. Include:
  - Current wholesale/retail prices
  - Trend graph (text format)
  - Demand forecast
  - Best selling locations
  - Best farmer strategy`;

  return await getAgriculturalInsights(prompt, language);
};

// 3. Pest Advisory
export const getPestAdvisory = async (crop, region, language) => {
  const prompt = `Provide pest/disease advisory for ${crop} in ${region} in ${language}. Include:
  - Current risk level
  - Symptoms farmers should check
  - Prevention steps
  - Organic treatments
  - Chemical solutions (only if severe)`;

  return await getAgriculturalInsights(prompt, language);
};

// ⭐ 4. LOCATION-ONLY AI PROMPT (New Function)
export const getAgricultureByLocation = async (location, language = 'en') => {
  const prompt = `
  Based only on the location "${location}", generate a complete agricultural insights report.

  Output MUST be in clean JSON format:

  {
    "location": "",
    "weather": {},
    "bestCrops": [],
    "fertilizerRecommendations": [],
    "spraySchedule": {},
    "soilAdvice": "",
    "irrigationAdvice": "",
    "pestRisk": [],
    "marketDemand": [],
    "todayActions": []
  }

  Sections to include:

  1. Current weather summary (temp, humidity, rainfall, sunlight)
  2. Best crops to grow today based on climate + season
  3. 5 fertilizer spray recommendations with dose per litre
  4. Spray interval + precautions
  5. Soil preparation advice specific to this location
  6. Irrigation requirement for today
  7. Pest & disease risk prediction
  8. Market-demand crops for the next 30 days
  9. Final actionable steps for the farmer today

  Language: ${language}
  Strictly output JSON only.
  `;

  return await getAgriculturalInsights(prompt, language);
};

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_GEMINI_KEY);

// Agricultural AI Model Configuration
const agriModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are Krishi Mitra, an AI agricultural assistant for Maharashtra farmers. Provide:
  1. Accurate weather forecasts in Marathi/English
  2. Crop-specific advice for sugarcane, soybean, cotton etc.
  3. Practical farming recommendations
  4. Market price analysis
  5. Pest/disease warnings
  Always respond in the user's preferred language.`,
});

export const getAgriculturalInsights = async (prompt, language = 'en') => {
  try {
    const result = await agriModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Service Error:", error);
    return language === 'mr'
      ? 'त्रुटी: कृपया पुन्हा प्रयत्न करा'
      : 'Error: Please try again';
  }
};

// Specialized functions for different agricultural needs
export const getCropSpecificForecast = async (crop, location, language) => {
  const prompt = `Provide 7-day ${crop}-specific weather forecast for ${location} in ${language}. Include:
  - Daily weather conditions
  - Temperature ranges
  - Rainfall predictions
  - Growth impact analysis
  - Recommended farming actions`;

  return await getAgriculturalInsights(prompt, language);
};

export const getMarketAnalysis = async (crop, language) => {
  const prompt = `Analyze current market trends for ${crop} in Maharashtra in ${language}. Include:
  - Current prices
  - Price trends
  - Demand forecast
  - Best selling strategies`;

  return await getAgriculturalInsights(prompt, language);
};
  ``
export const getPestAdvisory = async (crop, region, language) => {
  const prompt = `Provide pest/disease advisory for ${crop} in ${region} in ${language}. Include:
  - Current risks
  - Prevention methods
  - Organic treatment options
  - Chemical treatment options (if severe)`;

  return await getAgriculturalInsights(prompt, language);
};
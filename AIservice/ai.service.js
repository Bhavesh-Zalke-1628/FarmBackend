import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from "dotenv";
config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You are a helpful assistant providing weather forecasts and their impact on sugarcane crops.  Provide forecasts in a clear, concise format.  For each day, indicate the weather, temperature (Celsius), and a brief analysis of its potential impact on sugarcane (helpful, harmless, or harmful), along with specific suggestions for mitigating any negative effects.`,
});

async function getSugarcaneWeatherForecast(location) {
    try {
        const prompt = `Provide a detailed 8-day weather forecast for ${location}, focusing on conditions relevant to sugarcane growth.  Include:
        * Daily weather description (e.g., sunny, cloudy, rainy)
        * Daily high and low temperatures (Celsius)
        * Wind speed and direction (if significant)
        * Humidity (if significant)
        * Rainfall amount (if any)

        For each day, analyze the potential impact on sugarcane (helpful, harmless, or harmful) and provide specific suggestions for mitigating any negative effects (e.g., irrigation strategies, fertilizer adjustments, pest control measures).`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error getting weather forecast:", error);
        return "Error getting weather forecast.";
    }
}

async function main() {
    const location = "pune"; // Replace with the actual location
    const forecast = await getSugarcaneWeatherForecast(location);
}

main();

export default getSugarcaneWeatherForecast;
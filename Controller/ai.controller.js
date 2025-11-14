import { getAgricultureByLocation, getCropSpecificForecast, getMarketAnalysis, getPestAdvisory } from "../AIservice/ai.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// -------------------------
// Get Data Using Only Location
// -------------------------
export const locationBasedInsights = asyncHandler(async (req, res) => {
    try {
        const { location, language = "en" } = req.body;

        if (!location) {
            return res.status(400).json({ error: "Location is required" });
        }

        console.log(req.body)
        const data = await getAgricultureByLocation(location, language);
        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// -------------------------
// Crop-Specific Weather Forecast
// -------------------------
export const cropForecastController = asyncHandler(async (req, res) => {
    try {
        const { crop, location, language = "en" } = req.body;

        if (!crop || !location) {
            return res.status(400).json({ error: "Crop & location are required" });
        }

        const data = await getCropSpecificForecast(crop, location, language);
        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// -------------------------
// Market Price Analysis
// -------------------------
export const marketAnalysisController = asyncHandler(async (req, res) => {
    try {
        const { crop, language = "en" } = req.body;

        if (!crop) {
            return res.status(400).json({ error: "Crop is required" });
        }

        const data = await getMarketAnalysis(crop, language);
        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// -------------------------
// Pest Advisory Controller
// -------------------------
export const pestAdvisoryController = asyncHandler(async (req, res) => {
    try {
        const { crop, region, language = "en" } = req.body;

        if (!crop || !region) {
            return res.status(400).json({ error: "Crop & region are required" });
        }

        const data = await getPestAdvisory(crop, region, language);
        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

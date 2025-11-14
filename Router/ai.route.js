import express from "express";
import {
    cropForecastController,
    locationBasedInsights,
    marketAnalysisController,
    pestAdvisoryController
} from "../Controller/ai.controller.js";


const router = express.Router();

router.post("/location-insights", locationBasedInsights);
router.post("/crop-forecast", cropForecastController);
router.post("/market-analysis", marketAnalysisController);
router.post("/pest-advisory", pestAdvisoryController);

export default router;

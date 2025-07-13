import axios from 'axios';

export const getCropAdvice = async (req, res) => {
    const { crop } = req.body;

    try {
        const response = await axios.post('http://127.0.0.1:5001/api/crop-advice', {
            crop: crop
        });


        res.status(200).json(response.data); // Send AI output to frontend
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch crop advice",
            message: error?.response?.data || error.message
        });
    }
};



export const getFullAnalysis = async (req, res) => {
    const { lat, lon } = req.body;

    try {
        const response = await axios.post('http://127.0.0.1:5001/api/full-analysis', {
            location: { lat, lon }
        });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch full analysis",
            message: error?.response?.data || error.message
        });
    }
};

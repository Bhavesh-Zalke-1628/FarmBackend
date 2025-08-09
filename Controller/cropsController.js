import { asyncHandler } from "../utils/asyncHandler.js";
import User from '../Model/userModel.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'


const addCrop = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user;
        const { name, quantity } = req.body;

        const user = await User.findById(id).select('-password')

        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const existingCrop = user.crops.find(crop => crop.name === name);
        if (existingCrop) {
            throw new ApiError(400, "Crop already exists");
        }
        user.crops.push({ name, quantity });
        await user.save();
        res.status(201).json(new ApiResponse(201, user.crops, "Crop added successfully"));

    } catch (error) {
        throw new ApiError(500, "Something went wronge")
    }
})

const getCrops = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id).select('-password');

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.crops.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No crops listed")
            );
        }

        res.status(200).json(
            new ApiResponse(200, user.crops, "Crops fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong");
    }
});

const deleteCrop = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user;
        const { cropId } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const cropIndex = user.crops.findIndex(crop => crop._id.toString() === cropId);
        if (cropIndex === -1) {
            throw new ApiError(404, "Crop not found");
        }
        user.crops.splice(cropIndex, 1);
        await user.save();
        res.status(200).json(new ApiResponse(200, user.crops, "Crop deleted successfully"));
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong")
    }
})

const updateCrop = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user;
        const { cropId } = req.params;
        const { name, variety, quantity } = req.body;

        const user = await User.findById(id).select('-password');
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const crop = user.crops.find(crop => crop._id.toString() === cropId);
        if (!crop) {
            throw new ApiError(404, "Crop not found");
        }

        crop.name = name || crop.name;
        crop.variety = variety || crop.variety;
        crop.quantity = quantity || crop.quantity;

        await user.save();
        res.status(200).json(new ApiResponse(200, user.crops, "Crop updated successfully"));
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong")
    }
})

export {
    addCrop,
    getCrops,
    deleteCrop,
    updateCrop
}
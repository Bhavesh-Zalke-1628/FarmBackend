import { asyncHandler } from "../utils/asyncHandler.js";
import Store from "../Model/storemodel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../Model/userModel.js";

const getAllStore = asyncHandler(async (req, res) => {
    try {
        const store = await Store.find({});
        if (!store) {
            throw new ApiError(400, "Store not found");
        }

        return res.status(200).json(
            new ApiResponse(200, store, "Store data")
        )
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to get all store ");
    }
})

const getStoreById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        // const store = await Store.findById(id).populate("products");
        const store = await Store.find({ owner: id }).populate("owner products")


        if (!store) {
            throw new ApiError(400, "Store not found");
        }

        return res.status(200).json(new ApiResponse(200, store, "Store data"));

    } catch (error) {
        throw new ApiError(400, error.message || "Failed to get store");
    }
})

const createStore = asyncHandler(async (req, res, next) => {
    try {
        const { name, email, contact, address } = req.body;


        const user = await User.findById(req?.user?.id)

        if (!user) {
            return next(new ApiError(401, "Unauthorized: User not found"));
        }

        if ([name, email, address].some((field) => field?.trim() === "")) {
            return next(new ApiError(400, "All fields are required"));
        }

        const store = await Store.create({
            name,
            email,
            contact,
            address,
            owner: req.user.id // ✅ Using the authenticated user's ID
        });

        const createdStore = await Store.findById(store._id).populate("owner");

        if (!createdStore) {
            return next(new ApiError(400, "Failed to create the store"));
        }


        user.role = 'admin';
        // user.store = createdStore._id;
        await user.save();

        return res.status(201).json(new ApiResponse(201, createdStore, "Store created successfully"));

    } catch (error) {
        return next(new ApiError(500, error.message || "Failed to create the store"));
    }
});


const updateStore = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address, contact } = req.body;


        const existingStore = await Store.findById(id);
        if (!existingStore) {
            throw new ApiError(400, "Store not found");
        }

        const updatedStore = await Store.findByIdAndUpdate(
            id,
            {
                name,
                email,
                address,
                contact,
            },
            {
                new: true,
            }
        )

        if (!updatedStore) {
            throw new ApiError(400, "Failed to update the store")
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                updatedStore,
                "Store update successfully"
            )
        )

    } catch (error) {
        throw new ApiError(400, error.message || "Failed to update the store ");
    }
})

const deleteStore = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Check if store exists before deletion
        const store = await Store.findById(id);
        if (!store) {
            throw new ApiError(400, "Store not found");
        }

        // Delete the store
        await Store.findByIdAndDelete(id);

        return res.status(200).json(
            new ApiResponse(200, null, "Store deleted successfully")
        );

    } catch (error) {
        throw new ApiError(400, error.message || "Failed to delete the store");
    }
});


export {
    getAllStore,
    getStoreById,
    createStore,
    updateStore,
    deleteStore
}
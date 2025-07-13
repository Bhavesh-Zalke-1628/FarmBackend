import OrderDetails from "../Model/orderDetailsModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Create new OrderDetails
export const createOrderDetails = asyncHandler(async (req, res) => {
    try {
        const {
            customer,
            orderPayment,
            products,
            totalAmount,
            orderStatus,
            deliveryAddress,
            expectedDeliveryDate,
            notes,
        } = req.body;

        // if (!customer || !orderPayment || !products?.length || !totalAmount) {
        //     throw new ApiError(400, "All required fields must be provided");
        // }

        const newOrder = await OrderDetails.create({
            customer,
            orderPayment,
            products,
            totalAmount,
            orderStatus,
            deliveryAddress,
            expectedDeliveryDate,
            notes,
        });

        res.status(201).json(new ApiResponse(201, newOrder, "Order created successfully"));
    } catch (error) {
        throw new ApiError(400, "Failed to create the details")
    }
});

// Get all OrderDetails
export const getAllOrderDetails = asyncHandler(async (req, res) => {
    const orders = await OrderDetails.find()
        .populate("customer")
        .populate("orderPayment")
        .populate("products.product");

    res.status(200).json(new ApiResponse(200, orders, "Fetched all orders"));
});

// Get single OrderDetails by ID
export const getOrderDetailsById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await OrderDetails.findById(id)
        .populate("customer", "name email")
        .populate("orderPayment")
        .populate("products.product");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

// Update OrderDetails
export const updateOrderDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updatedOrder = await OrderDetails.findByIdAndUpdate(id, req.body, {
        new: true,
    });

    if (!updatedOrder) {
        throw new ApiError(404, "Order not found");
    }

    res.status(200).json(new ApiResponse(200, updatedOrder, "Order updated successfully"));
});

// Delete OrderDetails
export const deleteOrderDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedOrder = await OrderDetails.findByIdAndDelete(id);

    if (!deletedOrder) {
        throw new ApiError(404, "Order not found");
    }

    res.status(200).json(new ApiResponse(200, deletedOrder, "Order deleted successfully"));
});

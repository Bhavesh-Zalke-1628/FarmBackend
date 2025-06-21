import OrderDetails from "../Model/orderDetailsModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ 1. Create new order details
const createOrderDetails = asyncHandler(async (req, res) => {
    try {

        const {
            customer_id,
            order_id,
            products,
            total,
            paymentMethod,
            status = 'pending'
        } = req.body;

        if (!customer_id || !order_id || !Array.isArray(products) || !products.length || !total || !paymentMethod) {
            throw new ApiError(400, "All required fields must be provided");
        }

        const orderDetails = await OrderDetails.create({
            customer_id,
            order_id,
            products,
            total,
            paymentMethod,
            status,
        });

        res.status(200).json(
            new ApiResponse(200, orderDetails, "Order details created successfully")
        );
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to create order details");
    }
});

// ✅ 2. Get all orders
const getAllOrderDetails = asyncHandler(async (req, res) => {
    try {
        const orders = await OrderDetails.find()
            .populate("customer_id", "name email")
            .populate("order_id", "paymentId status")
            .populate("products.product_id", "name price");

        res.status(200).json(new ApiResponse(200, orders, "Fetched all order details"));
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to fetch order details");
    }
});

// ✅ 3. Get orders by customer
const getOrderDetailsByCustomerId = asyncHandler(async (req, res) => {
    try {
        const { customerId } = req.params;

        const orders = await OrderDetails.find({ customer_id: customerId })
            .populate("products.product_id", "name price")
            .populate("order_id", "paymentId status");

        if (!orders.length) {
            throw new ApiError(404, "No orders found for this customer");
        }

        res.status(200).json(new ApiResponse(200, orders, "Fetched customer's order details"));
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to fetch customer's order details");
    }
});

// ✅ 4. Update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatus = ["pending", "shipped", "delivered"];
        if (!validStatus.includes(status)) {
            throw new ApiError(400, "Invalid status value");
        }

        const updatedOrder = await OrderDetails.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            throw new ApiError(404, "Order not found");
        }

        res.status(200).json(new ApiResponse(200, updatedOrder, "Order status updated"));
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to update order status");
    }
});

// ✅ 5. Delete an order
const deleteOrderDetails = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;

        const deletedOrder = await OrderDetails.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            throw new ApiError(404, "Order not found");
        }

        res.status(200).json(new ApiResponse(200, deletedOrder, "Order deleted successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to delete order");
    }
});

export {
    createOrderDetails,
    updateOrderStatus,
    deleteOrderDetails,
    getAllOrderDetails,
    getOrderDetailsByCustomerId
};

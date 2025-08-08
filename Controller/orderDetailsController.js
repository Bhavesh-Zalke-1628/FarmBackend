import OrderDetails from "../Model/orderDetailsModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Create new OrderDetails
export const createOrderDetails = asyncHandler(async (req, res) => {
    console.log("req.body", req.body);
    // try {
    const {
        orderId, // This should come from req.body
        orderPayment,
        products,
        totalAmount,
        deliveryAddress
    } = req.body;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    // Calculate expected delivery date (5 days from now)
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5);

    // Transform products array
    const transformedProducts = products.map(product => ({
        product: product.productId,
        quantity: product.quantity,
        price: product.discountedPrice
    }));

    // Convert delivery address to string
    const addressString = `${deliveryAddress.fullName}, ${deliveryAddress.addressLine}, ${deliveryAddress.city}, ${deliveryAddress.state}, ${deliveryAddress.zip}, ${deliveryAddress.country}`;

    // print the data
    console.log("Transformed Products:", transformedProducts);
    console.log("Address String:", addressString);
    // Create new order details
    console.log("Creating new order with ID:", orderId);
    console.log("Order Payment:", orderPayment);
    console.log("Total Amount:", totalAmount);
    console.log("Expected Delivery Date:", expectedDeliveryDate);
    console.log("Delivery Address:", addressString);
    console.log("Customer ID:", req.user.id);
    console.log("Products:", transformedProducts);
    // Create the order details
    console.log("Creating new order details...");



    const newOrder = await OrderDetails.create({
        order: orderId, // Make sure this is included
        customer: req.user.id,
        orderPayment,
        products: transformedProducts,
        totalAmount: totalAmount.toFixed(2),
        orderStatus: "pending",
        deliveryAddress: addressString,
        expectedDeliveryDate,
    });
    console.log("newOrder", newOrder)

    res.status(201).json(new ApiResponse(201, newOrder, "Order created successfully"));
    // } catch (error) {
    //     console.error("Error creating order:", error);
    //     throw new ApiError(400, error.message || "Failed to create the order details");
    // }
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

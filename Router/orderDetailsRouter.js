import { Router } from "express";
import { isLoggedIn } from "../Middlerware/authMiddleWare.js";
import {
    createOrderDetails,
    getAllOrderDetails,
    getOrderDetailsByCustomerId,
    updateOrderStatus,
    deleteOrderDetails
} from "../Controller/orderDetailsController.js";

const router = Router();

// ✅ Create order details (POST)
router.route("/create-order-details").post(isLoggedIn, createOrderDetails);

// ✅ Get all orders (GET)
router.route("/all-order-details").get(getAllOrderDetails);

// ✅ Get orders by customer (GET)F
router.route("/customer-orders/:customerId").get(getOrderDetailsByCustomerId);

// ✅ Update order status (PUT)
router.route("/update-order-status/:orderId").put(isLoggedIn, updateOrderStatus);

// ✅ Delete order (DELETE)
router.route("/delete-order-details/:orderId").delete(isLoggedIn, deleteOrderDetails);

export default router;

import { Router } from "express";
import {
    createOrderDetails,
    getAllOrderDetails,
    // getOrderDetailsByCustomerId,
    updateOrderDetails,
    deleteOrderDetails
} from "../Controller/orderDetailsController.js";
import { isLoggedIn } from "../Middlerware/authMiddleWare.js";

const router = Router();

// ✅ Create order details (POST)
router.route("/create-order-details").post(isLoggedIn, createOrderDetails);

// ✅ Get all orders (GET)
router.route("/").get(getAllOrderDetails);

// ✅ Get orders by customer (GET)F
// router.route("/customer-orders/:customerId").get(getOrderDetailsByCustomerId);

// ✅ Update order status (PUT)
router.route("/update-order-status/:orderId").put(updateOrderDetails);

// ✅ Delete order (DELETE)
router.route("/delete-order-details/:orderId").delete(deleteOrderDetails);

export default router;

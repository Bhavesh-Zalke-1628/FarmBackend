// routes/paymentRoutes.js
import { Router } from "express";
import { createCODPayment, createOrder, downloadReceipt, getRazorpayKey, verifyPayment } from "../Controller/orderPaymentController.js";

const router = Router()

router.get("/razorpay/getid", getRazorpayKey);
router.post("/razorpay/order", createOrder);
router.post("/razorpay/verify", verifyPayment);
router.get("/razorpay/receipt/:id", downloadReceipt);
router.post("/cash-order", createCODPayment);

export default router
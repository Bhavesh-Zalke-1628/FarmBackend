// routes/paymentRoutes.js
import { Router } from "express";
import { createOrder, downloadReceipt, getRazorpayKey, verifyPayment } from "../Controller/orderPaymentController.js";
import { isLoggedIn } from "../Middlerware/authMiddleWare.js";

const router = Router()

router.get("/razorpay/getid", isLoggedIn, getRazorpayKey);
router.post("/razorpay/order", isLoggedIn, createOrder);
router.post("/razorpay/verify", isLoggedIn, verifyPayment);
router.get("/razorpay/receipt/:id", isLoggedIn, downloadReceipt);



export default router
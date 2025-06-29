import crypto from "crypto";
import PDFDocument from "pdfkit";
import razorpayInstance from "../utils/razorpayInstance.js";
import OrderPayment from "../Model/orderPaymentModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import generateOrderId from "../utils/orderUtils.js";

// ✅ GET /payment/razorpay/getid
const getRazorpayKey = (req, res) => {
    try {
        return res.status(200).json(
            new ApiResponse(200, { key: process.env.RAZORPAY_KEY_ID }, "Razorpay key")
        );
    } catch (error) {
        throw new ApiError(400, "Something went wrong while retrieving Razorpay key");
    }
};

// ✅ POST /payment/razorpay/order
const createOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    console.log(amount)
    const orderId = generateOrderId()
    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    return res.status(201).json(
        new ApiResponse(201, {
            orderId,
            razorpayOrderId: order.id,
            currency: order.currency,
            amount: order.amount,
        }, "Order created successfully")
    );
});

// ✅ POST /payment/razorpay/verify
const verifyPayment = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, orderId } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid signature")
        );
    }

    const paymentRecord = await OrderPayment.create({
        paymentMethod: "online",
        orderId,
        razorpayOrderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount,
        currency: "INR",
        status: "paid",
        user: req.user?.id || null,
    });

    return res.status(200).json(
        new ApiResponse(200, paymentRecord, "Payment verified successfully")
    );
});

// ✅ GET /payment/razorpay/receipt/:id
const downloadReceipt = asyncHandler(async (req, res) => {
    const payment = await OrderPayment.findOne({
        $or: [
            { paymentId: req.params.id },
            { orderId: req.params.id }
        ]
    }).populate("user");

    if (!payment) {
        return res.status(404).json(
            new ApiResponse(404, null, "Payment not found")
        );
    }

    const doc = new PDFDocument();
    const fileName = `Receipt_${payment._id}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("🧾 Payment Receipt", { align: "center" }).moveDown();

    doc.fontSize(14)
        .text(`Receipt No: ${payment._id}`)
        .text(`Order ID: ${payment.orderId}`)
        .text(`Razorpay Order ID: ${payment.razorpayOrderId || "N/A"}`)
        .text(`Payment ID: ${payment.paymentId || "N/A"}`)
        .text(`Payment Method: ${payment.paymentMethod}`)
        .text(`Amount Paid: ₹${(payment.amount / 100).toFixed(2)}`)
        .text(`Currency: ${payment.currency}`)
        .text(`Status: ${payment.status}`)
        .text(`Date: ${new Date(payment.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        })}`)
        .moveDown();

    if (payment.user) {
        doc.fontSize(16).text("👤 User Details", { underline: true }).moveDown(0.5);
        doc.fontSize(14)
            .text(`Username: ${payment.user.username || "N/A"}`)
            .text(`Email: ${payment.user.email || "N/A"}`)
            .text(`Phone: ${payment.user.phone || "N/A"}`);
    } else {
        doc.fontSize(14).text("User details not available");
    }

    doc.end();
});

// ✅ POST /payment/razorpay/cash
const createCODPayment = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    console.log(amount)
    const orderId = generateOrderId();

    const paymentRecord = await OrderPayment.create({
        paymentMethod: "cash",
        orderId,
        amount: amount * 100,
        currency: "INR",
        status: "pending",
        user: req?.user?.id || null,
    });

    return res.status(200).json(
        new ApiResponse(200, paymentRecord, "COD order recorded successfully")
    );
});

export {
    getRazorpayKey,
    createOrder,
    verifyPayment,
    downloadReceipt,
    createCODPayment
};

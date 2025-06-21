import crypto from "crypto";
import PDFDocument from "pdfkit";
import razorpayInstance from "../utils/razorpayInstance.js";
import OrderPayment from "../Model/orderPaymentModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /payment/razorpay/getid
const getRazorpayKey = (req, res) => {
    res.status(200).json({
        success: true,
        data: { key: process.env.RAZORPAY_KEY_ID },
    });
};

// POST /payment/razorpay/order
const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);

        console.log(order)

        res.status(201).json(new ApiResponse(
            200,
            {
                orderId: order.id,
                currency: order.currency,
                amount: order.amount,
            },
            "order create successfully")
        );
    } catch (err) {
        res.status(500).json({ success: false, message: "Order creation failed", error: err.message });
    }
};
// POST /payment/razorpay/verify
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
        console.log(req.body)
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const paymentRecord = await OrderPayment.create({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            amount,
            currency: "INR",
            status: "paid",
            user: req.user?.id, // Add if you have auth middleware
        });

        res.status(200).json({ success: true, data: paymentRecord, message: "Payment verified successfully" });

    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: "Payment verification failed", error: err.message });
    }
};

// GET /payment/razorpay/receipt/:id
const downloadReceipt = async (req, res) => {
    try {
        const payments = await OrderPayment.find({ paymentId: req.params.id }).populate("user");

        console.log(req.user)

        if (!payments || payments.length === 0) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        const payment = payments[0];
        const user = payment.user;

        console.log(payments)

        const doc = new PDFDocument();
        const fileName = `Receipt_${payment._id}.pdf`;

        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);

        doc.fontSize(20).text("🧾 Razorpay Payment Receipt", { align: "center" });
        doc.moveDown();

        // Payment info
        doc.fontSize(14).text(`Receipt No: ${payment._id}`);
        doc.text(`Order ID: ${payment.orderId}`);
        doc.text(`Payment ID: ${payment.paymentId}`);
        doc.text(`Amount Paid: ₹${(payment.amount / 100).toFixed(2)}`);
        doc.text(`Currency: ${payment.currency}`);
        doc.text(`Status: ${payment.status}`);
        doc.text(`Date: ${new Date(payment.createdAt).toLocaleString()}`);
        doc.moveDown();

        // User info (if available)
        if (user) {
            doc.fontSize(16).text("User Details", { underline: true });
            doc.fontSize(14).text(`Username: ${user.username || "N/A"}`);
            doc.text(`Email: ${user.email || "N/A"}`);
            doc.text(`Phone: ${user.phone || "N/A"}`);
        } else {
            doc.fontSize(14).text("User details not available");
        }

        doc.end();
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to generate receipt", error: err.message });
    }
};


export {
    getRazorpayKey,
    createOrder,
    verifyPayment,
    downloadReceipt,
};

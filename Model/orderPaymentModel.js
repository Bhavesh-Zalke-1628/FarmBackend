import { Schema, model } from "mongoose";

const orderPaymentSchema = new Schema(
    {
        paymentMethod: {
            type: String,
            enum: ["cash", "online"],
            required: true,
        },

        orderId: {
            type: String,
        },

        razorpayOrderId: {
            type: String, // Razorpay order ID for online, optional for cash
        },

        paymentId: {
            type: String, // Razorpay payment ID, optional for cash
        },

        signature: {
            type: String, // Razorpay signature, optional for cash
        },

        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "INR",
        },

        status: {
            type: String,
            enum: ["created", "paid", "failed", "pending"], // added "pending" for COD
            default: "created",
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

    },
    { timestamps: true }
);

const OrderPayment = model("OrderPayment", orderPaymentSchema);

export default OrderPayment;

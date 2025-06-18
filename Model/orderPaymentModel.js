import { Schema, model } from "mongoose";
const orderPaymentSchema = new Schema(
    {
        orderId: String,
        paymentId: String,
        signature: String,
        amount: Number,
        currency: String,
        status: {
            type: String,
            enum: ["created", "paid", "failed"],
            default: "created",
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User", // Optional: only if you want to track per user
        },
    },
    { timestamps: true }
);

const OrderPayment = model("orderPayment", orderPaymentSchema)

export default OrderPayment
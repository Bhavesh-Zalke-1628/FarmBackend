import { Schema, model } from "mongoose";

const orderDetailsSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            // required: true,
        },

        orderPayment: {
            type: Schema.Types.ObjectId,
            ref: "OrderPayment",
            // required: true,
        },

        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "products",
                    // required: true,
                },
                quantity: {
                    type: Number,
                    // required: true,
                },
                price: {
                    type: Number,
                    // required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            // required: true,
        },
        orderStatus: {
            type: String,
            enum: ["pending", "shipped", "delivered"],
            default: "pending",
        },
        deliveryAddress: {
            type: String,
            // required: true,
        },
        expectedDeliveryDate: {
            type: Date,
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

const OrderDetails = model("OrderDetails", orderDetailsSchema);

export default OrderDetails;

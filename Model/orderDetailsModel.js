import { Schema, model } from "mongoose";

const orderDetailsSchema = Schema({
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'OrderPayment',
        required: true
    },
    products: [
        {
            product_id: {
                type: Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered'],
        default: 'pending',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        default: 'cash',
    },
});

const OrderDetails = model("OrderDetails", orderDetailsSchema);

export default OrderDetails;

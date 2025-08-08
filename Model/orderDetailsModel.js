import { Schema, model } from "mongoose";

const orderDetailsSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Customer reference is required"],
            index: true
        },

        order: {  // Changed from orderId to be more semantic
            type: Schema.Types.ObjectId,
            ref: "OrderPayment",
            required: [true, "Order reference is required"],
            unique: true,
            index: true
        },

        orderPayment: {
            type: String,
            enum: {
                values: ["cash", "online"],
                message: "Payment method must be either 'cash' or 'online'"
            },
            default: "cash",
            required: true
        },

        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: [true, "Product reference is required"]
                },
                quantity: {
                    type: Number,
                    required: [true, "Quantity is required"],
                    min: [1, "Quantity must be at least 1"]
                },
                price: {
                    type: Number,
                    required: [true, "Price is required"],
                    min: [0, "Price cannot be negative"]
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: [0, "Total amount cannot be negative"]
        },

        orderStatus: {
            type: String,
            enum: {
                values: ["pending", "shipped", "delivered", "cancelled"],
                message: "Invalid order status"
            },
            default: "pending"
        },

        deliveryAddress: {
            type: String,
            required: [true, "Delivery address is required"],
            trim: true,
            minlength: [10, "Address too short"]
        },

        expectedDeliveryDate: {
            type: Date,
            validate: {
                validator: function (date) {
                    return date > new Date();
                },
                message: "Delivery date must be in the future"
            }
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [500, "Notes cannot exceed 500 characters"]
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better query performance
orderDetailsSchema.index({ customer: 1, orderStatus: 1 });
orderDetailsSchema.index({ "products.product": 1 });

// Virtual population (if you need to access orders from other models)
orderDetailsSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'order'
});

const OrderDetails = model("OrderDetails", orderDetailsSchema);

export default OrderDetails;
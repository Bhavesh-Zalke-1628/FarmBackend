import { Schema, model } from "mongoose";
import { type } from "os";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            default: 0,
        },
        store: {
            type: Schema.Types.ObjectId,
            ref: "Store", // ✅ Capitalized correctly
        },
        price: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            required: true
        },
        img: {
            public_id: {
                type: String,
            },
            secure_url: {
                type: String,
            }
        },
        outOfStock: {
            type: Boolean,
            default: false
        },
        offerPercentage: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const Product = model("Product", productSchema); // ✅ Model name capitalized
export default Product;

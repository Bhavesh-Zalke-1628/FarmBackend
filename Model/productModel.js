import { Schema, model } from "mongoose";

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
        img: {
            public_id: {
                type: String,
            },
            secure_url: {
                type: String,
            }
        }
    },
    { timestamps: true }
);

const Product = model("Product", productSchema); // ✅ Model name capitalized
export default Product;

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
            ref: "Store",
        },
        price: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            required: true,
        },
        img: {
            public_id: {
                type: String,
            },
            secure_url: {
                type: String,
            },
        },

        content: {
            activeIngredients: [
                {
                    name: {
                        type: String,
                        // required: true
                    },
                    concentration: { type: String, required: true }, // e.g., "5%" or "50 mg/L"
                },
            ],
            targetPests: {
                type: [String], // e.g., ["Aphids", "Whiteflies"]
                default: [],
            },
            usageAreas: {
                type: [String], // e.g., ["Agriculture", "Garden"]
                default: [],
            },
            instructions: {
                type: String, // e.g., "Mix 10ml per liter of water."
                // required: true,
            },
            precautions: {
                type: String, // e.g., "Avoid contact with skin and eyes."
                // required: true,
            },
        },

        outOfStock: {
            type: Boolean,
            default: false,
        },
        offerPercentage: {
            type: Number,
            default: 0,
        },
        categeory: {
            type: String, // e.g., "Pesticide"
        },
    },
    {
        timestamps: true,
    }
);

const Product = model("Product", productSchema);
export default Product;

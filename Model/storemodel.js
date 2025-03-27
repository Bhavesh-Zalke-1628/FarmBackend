import { Schema, model } from "mongoose";

const storeSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    contact: {
        type: Number,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId, // ✅ Corrected field name
        ref: "Product" // ✅ Matches the model name exactly
    }],
    subscription: {
        plan_ID: String,
        status: {
            type: String,
            default: "inactive"
        }
    }
}, { timestamps: true });

const Store = model("Store", storeSchema); // ✅ Capitalized correctly
export default Store;

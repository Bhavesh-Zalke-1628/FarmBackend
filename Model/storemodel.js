import { Schema, model } from "mongoose";

const storeSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    contact: {
        type: Number,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }],
    subscription: {
        id: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ["active", "cancelled", "inactive"],
            default: "inactive"
        }
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: "Store"
    }
}, { timestamps: true });

const Store = model("Store", storeSchema);
export default Store;

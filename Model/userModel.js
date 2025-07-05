import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const cartItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product' // Reference to your Product model
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    offerPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            minLength: [5, "Full name must be at least 5 characters"],
            maxLength: [20, "Full name should be less than 20 characters"],
            trim: true,
            lowercase: true,
            index: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        email: {
            type: String,
            lowercase: true,
            trim: true
        },
        role: {
            type: String,
            enum: ['farmer', 'admin'],
            default: "farmer"
        },
        address: {
            type: String,
            trim: true,
            lowercase: true
        },
        mobileNumber: {
            type: String,
            unique: true
        },
        farm: {
            farmName: {
                type: String,
            },
            location: {
                type: String
            }
        },
        refreshToken: {
            type: String
        },
        cart: {
            items: [cartItemSchema],
            totalQuantity: {
                type: Number,
                default: 0
            },
            totalPrice: {
                type: Number,
                default: 0
            },
            totalDiscount: {
                type: Number,
                default: 0
            },
            shippingFee: {
                type: Number,
                default: 0
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        },
        orders: [
            {
                type: Schema.Types.ObjectId,
                ref: "OrderDetails"
            }
        ]
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

// Generate JWT Access Token
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        { id: this._id, role: this.role, userName: this.userName },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
};

// Generate JWT Refresh Token
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

// Compare Password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};


userSchema.methods.calculateCartTotals = function () {
    // Initialize all totals to 0
    const initialTotals = {
        quantity: 0,
        price: 0,
        discount: 0
    };

    // Calculate totals by reducing through cart items
    const { quantity, price, discount } = this.cart.items.reduce(
        (totals, item) => {
            const itemPrice = item.price * item.quantity;
            const itemDiscount = (item.price * (item.offerPercentage || 0) / 100) * item.quantity;

            return {
                quantity: totals.quantity + item.quantity,
                price: totals.price + itemPrice,
                discount: totals.discount + itemDiscount
            };
        },
        initialTotals
    );

    // Update cart with calculated values
    this.cart.totalQuantity = quantity;
    this.cart.totalPrice = price;
    this.cart.totalDiscount = discount;
    // this.cart.shippingFee =
    this.cart.updatedAt = new Date();

    // Return the updated cart (useful for chaining)
    return this;
};


const User = model("User", userSchema);
export default User;
import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
            select: false // Must explicitly select when querying
        },
        // email: {
        //     type: String,
        //     default: "",
        //     // unique: true, // Prevents duplicate emails
        //     lowercase: true,
        //     trim: true
        // },
        role: {
            type: String,
            enum: ['farmer', 'admin'], // Added "user" since it was defaulted before
            default: "farmer"
        },
        address: {
            type: String,
            trim: true,
            lowercase: true
        },
        mobileNumber: {
            type: String, // Changed to String to avoid number precision issues
            unique: true // Ensures no duplicate numbers
        },

        refreshToken: {
            type: String
        }
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
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
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
    console.log("Entered Password:", password);
    console.log("Hashed Password in DB:", this.password);

    return await bcrypt.compare(password, this.password);
};



const User = model("User", userSchema);
export default User;

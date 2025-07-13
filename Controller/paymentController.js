import { config } from "dotenv";
config();
import crypto from "crypto";
import { razorpay } from "../server.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Store from "../Model/storemodel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Payment from "../Model/paymentModel.js";
import User from "../Model/userModel.js";

// Get Razorpay Key
const getRazorpayKey = asyncHandler(async (req, res) => {
    const key = process.env.RAZORPAY_KEY_ID;
    res.status(200).json(new ApiResponse(200, { key }, "Razorpay Key fetched"));
});

// Buy Subscription
const buySubscription = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) throw new ApiError(400, "User not found");
    const planId = process.env.RAZORPAY_PLAN_ID;
    const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12
    });


    res.status(200).json(
        new ApiResponse(200, { subscription_id: subscription?.id }, "Subscription created")
    );
});

// Verify Subscription
const verifySbscription = asyncHandler(async (req, res) => {
    const {
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature,
        storeId
    } = req.body;

    const store = await Store.findById(storeId);
    if (!store) throw new ApiError(400, "Store not found");

    const signaturePayload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(signaturePayload)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new ApiError(400, "Signature mismatch. Verification failed.");
    }

    // Save the payment record
    await Payment.create({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id
    });

    // Save subscription info in the store
    store.subscription = {
        id: razorpay_subscription_id,
        status: "active"
    };

    await store.save();

    res.status(200).json(new ApiResponse(200, store, "Payment verified and subscription activated"));
});

export {
    getRazorpayKey,
    buySubscription,
    verifySbscription
};

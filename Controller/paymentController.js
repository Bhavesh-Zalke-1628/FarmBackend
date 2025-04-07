import { config } from "dotenv"
config();

import { razorpay } from '../server.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Store from "../Model/storemodel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../Model/userModel.js";

const getRazorpayKey = async (req, res, next) => {
    try {
        const getId = process.env.RazorpayKeyId
        res.status(200).json(
            new ApiResponse(200, { getId }, "Razorpay id")
        )
    } catch (error) {
        throw new ApiError(400, "Failed to get the key id")
    }
}


const buySubscription = asyncHandler(async (req, res, next) => {

    const { id } = req.user
    console.log(req.user)

    console.log(id)

    try {
        const user = await User.findById(id);
        console.log(user)
        if (!user) {
            throw new ApiError(400, "USer not found")
        }


        if (!process.env.RAZORPAY_PLAN_ID) {
            throw new ApiError(500, "Plan id  is missing")
        }
        console.log(typeof process.env.RAZORPAY_PLAN_ID,)

        async function createSubscription() {
            try {
                const subscriptionDetails = {
                    plan_id: process.env.RAZORPAY_PLAN_ID,
                    customer_notify: 1,
                    total_count: 12,
                };

                const subscription = await razorpay.subscriptions.create(subscriptionDetails);
                console.log("Subscription created successfully:", subscription);
                return subscription;
            } catch (error) {
                throw new ApiError(400, "failed to create the subscriotion");
            }
        }


        const subscription = await createSubscription()
        console.log('subscription', subscription);

        // store.subscription.id = subscription.id;
        // store.subscription.status = subscription.status;

        // await store.save();

        res.status(200).json({
            success: true,
            msg: "Subscribed successfully",
            subscription_id: subscription.id,
        });


        // subscription_id: subscription.id,
        res.status(200).json(new ApiResponse(200,
            {
                subscription_id: subscription.id,
            },
            "Subscription id creted successfully"
        ))


    } catch (error) {
        throw new ApiError(400, "Failed to create the subscription");
    }
});


const verifySbscription = async (req, res, next) => {
    const { id } = req.user;
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body
    console.log('razorpay_payment_id >', razorpay_payment_id, 'razorpay_signature >', razorpay_signature, 'razorpay_subscription_id >', razorpay_subscription_id)
    try {
        const store = await Store.findById(id)
        if (!store) {
            throw new ApiError(400, "Store not found")
        }

        const subscription_id = store.subscription.id

        console.log(subscription_id)
        const generatedSignature = crypto
            .createHash('sha256', process.env.key_secret)
            .update(`${razorpay_payment_id} |${subscription_id}`)
            .digest('hex')

        console.log('generatedSignature >', generatedSignature)
        // if (generatedSignature !== razorpay_signature) {
        //     return next(new Apperror("Payment not verified please try again", 400))
        // }

        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

        console.log(store?.subscription)
        store.subscription.status = 'active'
        console.log(store?.subscription)
        console.log(store)
        await store.save()
        res.status(200).json({
            success: true,
            msg: "Payment verified successfully",
            store
        })

        res.status(200).json(new ApiResponse(
            200,
            store,
            "Payment verified successfully"
        ))

    } catch (error) {
        throw new ApiError(400, "Failed to verify the payment")
    }
}

// const cancleSubscription = async (req, res, next) => {
//     const { id } = req.store
//     try {
//         const user = await User.findById(id)
//         console.log(user)
//         if (!user) {
//             return next(
//                 new Apperror("Unauthroised , Please log in", 400)
//             );
//         }
//         if (user.role == 'Admin') {
//             return next(
//                 new Apperror("Admin cannot purchase the subscription", 400)
//             );
//         }
//         const subscription_id = user.subscription.id
//         console.log(subscription_id)
//         const subscription = await razorpay.subscriptions.cancel(subscription_id);
//         console.log(subscription)
//         user.subscription.status = await subscription.status;
//         await user.save()

//         res.status(200).json({
//             success: true,
//             msg: "Subscription cancelled successfully",
//             user
//         })

//     } catch (error) {

//         console.log(
//             'error', error
//         )
//     }
// }

// const allPayment = async (req, res, next) => {
//     try {
//         // const { count = 100 } = req.query; // Accept `planId` from request query

//         const planId = process.env.RAZORPAY_PLAN_ID
//         const payments = await razorpay.subscriptions.all({
//             count: 100
//         });

//         const user = await User.find({ role: 'User' })

//         console.log(user)
//         // Filter subscriptions that match the given planId
//         const filteredPayments = payments.items.filter(subscription => subscription.plan_id === planId);

//         let totalSubscriptions = filteredPayments.length;
//         let activeSubscriptions = 0;
//         let createdSubscriptions = 0;
//         let paidSubscriptions = 0;
//         let remainingSubscriptionPayments = 0;
//         let monthlySalesRecord = {};

//         filteredPayments.forEach(subscription => {
//             if (subscription.status === 'active') activeSubscriptions++;
//             if (subscription.status === 'created') createdSubscriptions++;
//             if (subscription.paid_count > 0) paidSubscriptions++;
//             remainingSubscriptionPayments += subscription.remaining_count;

//             // Calculate month-wise payments
//             const date = new Date(subscription.created_at * 1000); // Convert timestamp to milliseconds
//             const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM format

//             if (monthlySalesRecord[monthKey]) {
//                 monthlySalesRecord[monthKey] += subscription.paid_count;
//             } else {
//                 monthlySalesRecord[monthKey] = subscription.paid_count;
//             }
//         });

//         // Convert data into an array for frontend charts
//         const salesData = new Array(12).fill(0); // Initialize with 12 months of zeros
//         Object.entries(monthlySalesRecord).forEach(([key, value]) => {
//             const monthIndex = parseInt(key.split("-")[1], 10) - 1; // Convert YYYY-MM to month index (0-based)
//             salesData[monthIndex] = value;
//         });

//         res.status(200).json({
//             success: true,
//             msg: "Filtered Subscription Data",
//             data: {
//                 totalSubscriptions,
//                 activeSubscriptions,
//                 createdSubscriptions,
//                 paidSubscriptions,
//                 remainingSubscriptionPayments,
//                 monthlySalesRecord: salesData,
//                 registerUser: user.length
//             }
//         });

//     } catch (error) {
//         console.error("Error fetching subscriptions:", error);
//         return next(new Apperror(error.message, 400));
//     }
// };


export {
    getRazorpayKey,
    buySubscription,
    // allPayment,
    verifySbscription,
    // cancleSubscription
}
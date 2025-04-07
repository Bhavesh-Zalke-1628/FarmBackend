import { Router } from "express";
import { buySubscription, getRazorpayKey, verifySbscription } from "../Controller/paymentController.js";
import { isLoggedIn } from "../Middlerware/authMiddleWare.js";

const router = Router()

router
    .route('/razorpay/getid')
    .get(
        getRazorpayKey
    )

router
    .route('/razorpay/subscribe')
    .post(
        isLoggedIn,
        buySubscription
    )

router
    .route('/razorpay/verify')
    .post(
        isLoggedIn,
        verifySbscription
    )

// router
//     .route('/unsubscribe')
//     .post(
//         isLoggedIn,
//         authorisedSubscriber,
//         cancleSubscription
//     )

// router
//     .route('/getdata')
//     .get(
//         // isLoggedIn,
//         // authorisedRoles('Admin'),
//         allPayment
//     )


export default router
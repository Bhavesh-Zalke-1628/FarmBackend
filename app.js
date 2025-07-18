import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
config();

const app = express();

// ✅ CORS Configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URI,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);

// ✅ Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));

// ✅ Routes
import authRouter from "./Router/userRoute.js";
import storeRoute from "./Router/storeRoute.js";
import productRoute from "./Router/productRoute.js";
import paymentRoute from "./Router/paymentRouter.js";
import orderPaymentRoute from "./Router/orderPaymentRouter.js";
import OrderDetailsRoute from "./Router/orderDetailsRouter.js";
import cartRoute from "./Router/cartRouter.js";
import adviceRouter from "./Router/cropAdviceRouter.js";

app.use("/api/v1/users", authRouter);
app.use("/api/v1/store", storeRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/order", orderPaymentRoute);
app.use("/api/v1/order-details", OrderDetailsRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/crop-advice", adviceRouter);

export { app };

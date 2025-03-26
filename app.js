import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import { config } from "dotenv"
config()

const app = express()
app.use(cors({
    origin: process.env.FRONTEND_URI,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import authRouter from './Router/userRoute.js'
import storeRoute from './Router/storeRoute.js'
import productRoute from './Router/productRoute.js'

//routes declaration
app.use("/api/v1/users", authRouter)
app.use("/api/v1/store", storeRoute)
app.use("/api/v1/product", productRoute)

export { app }
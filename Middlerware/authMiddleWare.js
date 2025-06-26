
import User from "../Model/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const isLoggedIn = async (req, res, next) => {
    try {
        // 1. Check for token in multiple locations
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "") ||
            req.body?.accessToken;

        if (!token) {
            throw new ApiError(401, "Authentication required - No token provided");
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 3. Check if user still exists in database
        const user = await User.findById(decoded?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "User no longer exists");
        }

        // 4. Check if user changed password after token was issued
        if (user.passwordChangedAfter(decoded.iat)) {
            throw new ApiError(401, "Password changed recently - Please log in again");
        }

        // 5. Attach user to request
        req.user = user;
        next();

    } catch (error) {
        // Handle specific JWT errors
        let message = "Authentication failed";
        let statusCode = 401;

        if (error.name === "JsonWebTokenError") {
            message = "Invalid token";
        } else if (error.name === "TokenExpiredError") {
            message = "Token expired - Please log in again";
        } else if (error instanceof ApiError) {
            message = error.message;
            statusCode = error.statusCode;
        }

        return next(new ApiError(statusCode, message));
    }
};

export { isLoggedIn };


const verifyJwt =
    asyncHandler(
        async (req, res, next) => {
            try {
                const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
                if (!token) {
                    throw new ApiError(400, "Unauthenticated request")
                }


                const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

                const user = await User.findById(decodedToken.id).select("-password -refreshToken")

                if (!user) {
                    throw new ApiError(401, "Invalid access token ");
                }

                req.user = user;
                next();
            } catch (error) {
                throw new ApiError(401, error?.message || "Invalid access token")
            }
        }
    )


const authorisedRoles = (...roles) => async (req, res, next) => {
    const currentUserRoles = req.user.role;
    if (!roles.includes(currentUserRoles)) {
        return next(
            new ApiError("You do not have permission to you access this route", 400)
        )
    }
    next()
}


const authorisedSubscriber = async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (user.role !== 'store' && user.subscription.status !== 'active') {
        return next(
            new ApiError('Plase subscribe to access this cource ', 400)
        );
    }
    next();
}

export { isLoggedIn, authorisedRoles, authorisedSubscriber, verifyJwt }

import User from "../Model/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

const getTokenFromRequest = (req) => {
    // 1. Check Authorization header (mobile apps often use this)
    if (req.header("Authorization")?.startsWith("Bearer ")) {
        return req.header("Authorization").replace("Bearer ", "");
    }

    // 2. Check cookies (web browsers)
    if (req.cookies?.accessToken) {
        return req.cookies.accessToken;
    }

    // 3. Check request body (for mobile API requests)
    if (req.body?.accessToken) {
        return req.body.accessToken;
    }

    // 4. Check query parameters (fallback for mobile)
    if (req.query?.accessToken) {
        return req.query.accessToken;
    }

    return null;
};

const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded?.id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "User account not found");
        }

        // Additional checks can be added here
        // if (user.passwordChangedAfter(decoded.iat)) {
        //     throw new ApiError(401, "Please login again - password changed");
        // }

        return user;
    } catch (error) {
        // Enhanced error handling for mobile clients
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Session expired - Please login again");
        } else if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid authentication token");
        }
        throw error;
    }
};

const isLoggedIn = asyncHandler(async (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
        throw new ApiError(401, "Authentication required - Please login");
    }

    req.user = await verifyToken(token);
    next();
});

const verifyJwt = asyncHandler(async (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
        throw new ApiError(401, "Unauthorized access - Token missing");
    }

    req.user = await verifyToken(token);
    next();
});

const authorisedRoles = (...roles) => asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
        throw new ApiError(403, `Access forbidden - Requires role: ${roles.join(", ")}`);
    }

    next();
});

const authorisedSubscriber = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "User not authenticated");
    }

    const user = await User.findById(req.user.id);

    if (user.role !== 'store' && user.subscription?.status !== 'active') {
        throw new ApiError(403, "Premium content - Please subscribe to access");
    }

    next();
});

export {
    isLoggedIn,
    verifyJwt,
    authorisedRoles,
    authorisedSubscriber
};
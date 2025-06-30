
import User from "../Model/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

const isLoggedIn = asyncHandler(async (req, res, next) => {
    // Check for token in cookies (standard web) or authorization header (common for mobile)
    let token = req.cookies.accessToken ||
        req.headers['authorization']?.replace('Bearer ', '') ||
        req.body.token ||
        req.query.token;


    if (!token) {
        return next(new ApiError('Authentication required. Please log in.', 401));
    }

    try {
        // Verify the token
        const userDetails = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attach user to request object
        req.user = userDetails;

        // If token came from header/body/query, set it as a cookie for web clients
        if (!req.cookies.accessToken && req.get('origin')) {
            res.cookie('accessToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
        }

        next();
    } catch (err) {
        // Handle specific JWT errors if needed
        let errorMessage = 'Invalid or expired token. Please log in again.';

        if (err.name === 'TokenExpiredError') {
            errorMessage = 'Session expired. Please log in again.';
        } else if (err.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid authentication token.';
        }

        return next(new ApiError(errorMessage, 401));
    }
});

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

export { authorisedRoles, authorisedSubscriber, verifyJwt, isLoggedIn }

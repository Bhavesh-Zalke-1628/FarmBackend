
import User from "../Model/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

const isLoggedIn = async (req, res, next) => {
    console.log(req.cookies.accessToken)

    const { accessToken } = req.cookies;


    if (!accessToken) {
        return next(new ApiError("unauthenticated ,Please log in again", 400))
    }
    const userDetails = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    req.user = userDetails
    next()
}


const verifyJwt =
    asyncHandler(
        async (req, res, next) => {
            try {
                const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
                if (!token) {
                    throw new ApiError(400, "Unauthenticated request")
                }

                console.log('token', token)

                const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

                console.log("decodedToken", decodedToken)
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
    console.log(req.user)
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
    console.log('authorisedSubscriber user >', user)
    // console.log(user.subscription.id)
    if (user.role !== 'store' && user.subscription.status !== 'active') {
        return next(
            new ApiError('Plase subscribe to access this cource ', 400)
        );
    }
    next();
}

export { isLoggedIn, authorisedRoles, authorisedSubscriber, verifyJwt }

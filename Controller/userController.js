import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import User from "../Model/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const cookieOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(400, "User not found");

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(400, error.message || "Something went wrong in generating tokens");
    }
};



const register = asyncHandler(async (req, res) => {

    const { fullName, password, mobileNumber } = req.body;

    if ([fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }


    const existedUser = await User.findOne({
        mobileNumber
    });

    if (existedUser) {
        throw new ApiError(400, "User exists with the username or mobile number");
    }

    const user = await User.create({
        password,
        mobileNumber,
        fullName,
    });

    const createdUser = await User.findById(user._id).select('-password');

    if (!createdUser) {
        throw new ApiError(400, "Failed to create the user");
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(createdUser._id)

    user.refreshToken = refreshToken;

    await user.save();

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(new ApiResponse(
            200,
            {
                user:
                    createdUser,
                accessToken,
                refreshToken,
            },
            "User created successfully"
        ));
});

const loginUser = asyncHandler(async (req, res) => {
    const { userName, mobileNumber, password } = req.body;

    const user = await User.findOne({
        mobileNumber
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    // Check if the password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid password");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);


    // Exclude password and refreshToken fields before sending response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        ));
}
);


const logOut = asyncHandler(async (req, res) => {
    const { id } = req.user;

    await User.findByIdAndUpdate(id, { $set: { refreshToken: undefined } }, { new: true });

    res
        .status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
    try {
        const inComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!inComingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = await jwt.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken.id);

        if (!user) {
            throw new ApiError(400, "Invalid refresh token");
        }

        if (inComingRefreshToken !== user.refreshToken) {
            throw new ApiError(400, "Refresh token is expired");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOption)
            .cookie("refreshToken", newRefreshToken, cookieOption)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, address, farmName, location } = req.body;
    console.log(fullName)
    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                fullName,
                email,
                address,
                farm: {
                    farmName,
                    location
                }
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});


const getAllUser = asyncHandler(async (req, res) => {
    try {

        const users = await User.find().select("-password -refreshToken");
        res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));

    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Error fetching users"));
    }
})
const updateProfilePicture = asyncHandler(async (req, res) => {
    const { id } = req.user;

    console.log(id)

    const user = await User.findById(id);

    console.log("user", user)

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (req.file) {
        const localPath = req.file.path;
        const profile = await uploadOnCloudinary(localPath);
        if (profile) {
            user.profile = {
                public_id: profile.public_id,
                secure_url: profile.secure_url,
            };
            await user.save();
        }
    }

    const updatedUser = await User.findById(id).select("-password -refreshToken");
    if (!updatedUser) {
        throw new ApiError(500, "Failed to update the profile picture");
    }

    res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});


export {
    register,
    loginUser,
    logOut,
    refreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getAllUser,
    updateProfilePicture
};

// import the packages
import { Router } from "express";
const router = Router()

import { getCurrentUser, loginUser, logOut, refreshToken, register, updateAccountDetails } from "../Controller/userController.js";
import { isLoggedIn, verifyJwt } from "../Middlerware/authMiddleWare.js";

router.route('/register').post(register);
router.route('/login-user').post(loginUser);

// secure route 
router.route('/logout').get(verifyJwt, logOut);

router.route('/refresh-token').post(refreshToken)

router.route('/get-user').get(verifyJwt, getCurrentUser)

router.route("/update-profile").put(isLoggedIn, verifyJwt, updateAccountDetails)

export default router;

// import the packages
import { Router } from "express";
const router = Router()

import { getCurrentUser, loginUser, logOut, refreshToken, register } from "../Controller/userController.js";
import { verifyJwt } from "../Middlerware/authMiddleWare.js";

router.route('/register').post(register);
router.route('/login-user').post(loginUser);
// router.route('/login/admin').post(loginAdmin)

// secure route 
router.route('/logout').get(verifyJwt, logOut);
router.route('/refresh-token').post(refreshToken)
router.route('/get-user').get(getCurrentUser)

export default router;

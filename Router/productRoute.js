import { Router } from "express";
import { authorisedRoles, isLoggedIn, verifyJwt } from "../Middlerware/authMiddleWare.js";
import { createProduct, deleteProduct, getAllProduct, getProductById, updateProduct } from "../Controller/productController.js";

const router = Router();

router.route('/create-product/:storeId').post(isLoggedIn, createProduct);
router.route('/get-product/:productId').get(isLoggedIn, getProductById);
router.route('/get-all-product').get(isLoggedIn, getAllProduct);
router.route('/update-product/:productId').put(isLoggedIn, verifyJwt, updateProduct);
router.route('/delete-product/:productId').delete(isLoggedIn, verifyJwt, deleteProduct);



export default router;


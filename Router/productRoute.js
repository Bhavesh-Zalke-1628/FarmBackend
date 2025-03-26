import { Router } from "express";
import { authorisedRoles, isLoggedIn, verifyJwt } from "../Middlerware/authMiddleWare.js";
import { createProduct, deleteProduct, getAllProduct, getProductById, updateProduct } from "../Controller/productController.js";

const router = Router();

router.route('/create-product').post(isLoggedIn, createProduct);
router.route('/get-product/:id').get(isLoggedIn, getProductById);
router.route('/get-all-product').get(isLoggedIn, getAllProduct);
router.route('/update-product/:id').put(isLoggedIn, authorisedRoles("store"), updateProduct);
router.route('/delete-product/:id').delete(isLoggedIn, verifyJwt, authorisedRoles('store', 'admin'), deleteProduct);



export default router;

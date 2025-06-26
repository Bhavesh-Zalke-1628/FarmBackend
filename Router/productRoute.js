import { Router } from "express";
import { authorisedRoles, isLoggedIn, verifyJwt } from "../Middlerware/authMiddleWare.js";
import { createProduct, deleteProduct, getAllProduct, getProductById, updateProduct, getProductByStoreId, changeStockStatus, updateProductQuantity } from "../Controller/productController.js";
import upload from "../Middlerware/multerMiddle.js";
const router = Router();

router.route('/create-product/:storeId').post(isLoggedIn, upload.single('productImg'), createProduct);
router.route('/get-product/:productId').get(isLoggedIn, getProductById);
router.route('/get-all-product').get(isLoggedIn , getAllProduct);
router.route('/update-product/:productId').put(isLoggedIn, verifyJwt, upload.single("productImg"), updateProduct);
router.route('/delete-product/:productId').delete(isLoggedIn, verifyJwt, deleteProduct);
router.route('/get-store-product/:storeId').get(isLoggedIn, verifyJwt, getProductByStoreId);
router.route('/change-stock-product/:productId').patch(isLoggedIn, changeStockStatus)
router.route('/change-product-quantity/:productId').patch(isLoggedIn, updateProductQuantity)



export default router;


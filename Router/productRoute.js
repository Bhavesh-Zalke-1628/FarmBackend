import { Router } from "express";
import { createProduct, deleteProduct, getAllProduct, getProductById, updateProduct, getProductByStoreId, changeStockStatus, updateProductQuantity } from "../Controller/productController.js";
import upload from "../Middlerware/multerMiddle.js";
import { isLoggedIn } from "../Middlerware/authMiddleWare.js";
const router = Router();

router.route('/create-product/:storeId').post(upload.single('productImg'), createProduct);
router.route('/get-product/:productId').get(getProductById);
router.route('/get-all-product').get(getAllProduct);
router.route('/update-product/:productId').put(upload.single("productImg"), updateProduct);
router.route('/delete-product/:productId').delete(deleteProduct);
router.route('/get-store-product/:storeId').get(getProductByStoreId);
router.route('/change-stock-product/:productId').patch(changeStockStatus)
router.route('/change-product-quantity/:productId').patch(updateProductQuantity)



export default router;
 
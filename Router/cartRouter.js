import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../Controller/cartController.js";
import { isLoggedIn } from "../Middlerware/authMiddleWare.js";

const router = Router();

router.use(isLoggedIn)

// Get user's cart
router.route("/").get(getCart);

// Add item to cart
router.route("/add").post(addToCart);

// Update item quantity in cart
router.route("/update/:productId").put(updateCartItem);

// Remove item from cart
router.route("/remove/:productId").delete(removeFromCart);

// Clear entire cart
router.route("/clear").delete(clearCart);

export default router;
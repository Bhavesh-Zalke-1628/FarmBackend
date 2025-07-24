import Product from "../Model/productModel.js";
import User from "../Model/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 🚩 Utility: Get user with cart
const getUserWithCart = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return user;
};

// 🚩 Helper: Calculate shipping fee
const calculateShippingFee = (netPrice) => {
    if (netPrice < 500) return 50;
    if (netPrice < 999) return 30;
    return 0; // free shipping for >= 999
};

// 🚩 Get Cart
const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .select('cart')
        .populate({
            path: 'cart.items.productId',
            select: 'name company price description img offerPercentage category outOfStock quantity',
            model: 'Product'
        });

    if (!user) throw new ApiError(404, "User not found");

    const netPrice = user.cart.totalPrice - user.cart.totalDiscount;
    const shippingFee = calculateShippingFee(netPrice);

    // Map cart items, gracefully handling deleted products
    const items = user.cart.items.map(item => {
        if (!item.productId) {
            // Product was deleted
            return {
                ...item.toObject(),
                isDeleted: true,
            };
        }
        const prod = item.productId;
        return {
            productId: prod._id,
            name: prod.name,
            company: prod.company,
            price: prod.price,
            quantity: item.quantity,
            description: prod.description,
            img: prod.img,
            offerPercentage: prod.offerPercentage || 0,
            category: prod.category,
            outOfStock: prod.outOfStock,
            stockQuantity: prod.quantity,
            addedAt: item.addedAt,
            discountedPrice: prod.price * (1 - (prod.offerPercentage || 0) / 100),
            totalPrice: prod.price * item.quantity,
            totalDiscount: ((prod.price * (prod.offerPercentage || 0)) / 100) * item.quantity,
        };
    });

    const summary = {
        totalQuantity: user.cart.totalQuantity,
        totalPrice: user.cart.totalPrice,
        totalDiscount: user.cart.totalDiscount.toFixed(2),
        netPrice,
        shippingFee,
        grandTotal: (netPrice + shippingFee).toFixed(2),
        updatedAt: user.cart.updatedAt,
    };

    return res.status(200).json(
        new ApiResponse(200, { cart: { items, summary } }, "Cart retrieved successfully")
    );
});

// 🚩 Add to Cart
const addToCart = asyncHandler(async (req, res) => {
    const { _id: productId, quantity = 1 } = req.body;
    if (!productId) throw new ApiError(400, "Product ID is required");
    if (quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const user = await getUserWithCart(req.user.id);
    const existingItem = user.cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        user.cart.items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity, // Use requested quantity
            offerPercentage: product.offerPercentage || 0
        });
    }
    user.calculateCartTotals();
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, { cart: user.cart }, "Item added to cart successfully")
    );
});

// 🚩 Update Cart Item Quantity
const updateCartItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

    const user = await getUserWithCart(req.user.id);
    const item = user.cart.items.find(item => item.productId.toString() === productId);
    if (!item) throw new ApiError(404, "Item not found in cart");

    item.quantity = quantity;
    user.calculateCartTotals();
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, { cart: user.cart }, "Cart item updated successfully")
    );
});

// 🚩 Remove from Cart
const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const user = await getUserWithCart(req.user.id);

    const initialCount = user.cart.items.length;
    user.cart.items = user.cart.items.filter(item => item.productId.toString() !== productId);
    if (user.cart.items.length === initialCount) throw new ApiError(404, "Item not found in cart");

    user.calculateCartTotals();
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, { cart: user.cart }, "Item removed from cart successfully")
    );
});

// 🚩 Clear Cart
const clearCart = asyncHandler(async (req, res) => {
    const user = await getUserWithCart(req.user.id);
    user.cart.items = [];
    user.cart.totalQuantity = 0;
    user.cart.totalPrice = 0;
    user.cart.totalDiscount = 0;
    user.cart.updatedAt = Date.now();
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, { cart: user.cart }, "Cart cleared successfully")
    );
});

export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};

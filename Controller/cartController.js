import Product from "../Model/productModel.js";
import User from "../Model/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Helper to get user with cart
const getUserWithCart = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        return user;
    } catch (error) {
        throw new ApiError(500, "Error fetching user cart", error);
    }
};



const getCart = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('cart')
            .populate({
                path: 'cart.items.productId',
                select: 'name company price description img offerPercentage category outOfStock quantity',
                model: 'Product'
            });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Calculate netPrice (total after discounts)
        const netPrice = user.cart.totalPrice - user.cart.totalDiscount;


        // shipping fee logic 
        // if price is less than 999 the fee is 30 and less than 500 is 50 and greater than 999 is free
        const shippingFee = netPrice < 999 ? 30 : netPrice < 500 ? 50 : 0;

        // Transform the populated data
        const populatedCart = {
            items: user.cart.items.map(item => {
                if (!item.productId) {
                    return {
                        ...item.toObject(),
                        productId: item.productId, // null if deleted
                        isDeleted: true
                    };
                }

                return {
                    productId: item.productId._id,
                    name: item.productId.name,
                    company: item.productId.company,
                    price: item.productId.price,
                    quantity: item.quantity,
                    description: item.productId.description,
                    img: item.productId.img,
                    offerPercentage: item.productId.offerPercentage || 0,
                    category: item.productId.category,
                    outOfStock: item.productId.outOfStock,
                    stockQuantity: item.productId.quantity,
                    addedAt: item.addedAt,
                    discountedPrice: item.productId.price * (1 - (item.productId.offerPercentage || 0) / 100),
                    totalPrice: item.productId.price * item.quantity,
                    totalDiscount: (item.productId.price * (item.productId.offerPercentage || 0) / 100) * item.quantity
            };
            }),
            summary: {
                totalQuantity: user.cart.totalQuantity,
                totalPrice: user.cart.totalPrice,
                totalDiscount: user.cart.totalDiscount.toFixed(2),
                netPrice: netPrice,
                shippingFee: shippingFee,
                grandTotal: (netPrice + shippingFee).toFixed(2),
                updatedAt: user.cart.updatedAt
            }
        };



        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { cart: populatedCart },
                    "Cart retrieved successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error getting cart",
            error
        );
    }
});

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
    console.log(req.body)
    try {
        const { _id: productId, quantity = 1, } = req.body;
        console.log(productId, quantity)

        if (!productId) {
            throw new ApiError(400, "Product ID is required");
        }

        if (quantity < 1) {
            throw new ApiError(400, "Quantity must be at least 1");
        }

        const product = await Product.findById(productId);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        console.log("product", product)

        const user = await getUserWithCart(req.user.id);

        const existingItem = user.cart.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.cart.items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                offerPercentage: product.offerPercentage || 0
            });
        }

        user.calculateCartTotals();
        await user.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { cart: user.cart },
                    "Item added to cart successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error adding item to cart",
            error
        );
    }
});

// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            throw new ApiError(400, "Quantity must be at least 1");
        }

        const user = await getUserWithCart(req.user.id);

        const item = user.cart.items.find(
            item => item.productId.toString() === productId
        );

        if (!item) {
            throw new ApiError(404, "Item not found in cart");
        }

        item.quantity = quantity;
        user.calculateCartTotals();
        await user.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { cart: user.cart },
                    "Cart item updated successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error updating cart item",
            error
        );
    }
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await getUserWithCart(req.user.id);

        const initialCount = user.cart.items.length;
        user.cart.items = user.cart.items.filter(
            item => item.productId.toString() !== productId
        );

        if (user.cart.items.length === initialCount) {
            throw new ApiError(404, "Item not found in cart");
        }

        user.calculateCartTotals();
        await user.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { cart: user.cart },
                    "Item removed from cart successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error removing item from cart",
            error
        );
    }
});

// Clear entire cart
const clearCart = asyncHandler(async (req, res) => {
    try {
        const user = await getUserWithCart(req.user.id);

        user.cart.items = [];
        user.cart.totalQuantity = 0;
        user.cart.totalPrice = 0;
        user.cart.totalDiscount = 0;
        user.cart.updatedAt = Date.now();

        await user.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { cart: user.cart },
                    "Cart cleared successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error clearing cart",
            error
        );
    }
});

export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
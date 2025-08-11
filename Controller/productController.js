import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Product from "../Model/productModel.js";
import Store from "../Model/storemodel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        console.log("Pagination:", { limit, skip });

        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        console.log(products.length)

        const totalCount = await Product.countDocuments();

        return res.status(200).json(new ApiResponse(200, {
            products,
            totalCount
        }, "Product data"));
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to get all products");
    }
});

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId).populate("store");

        if (!product) {
            throw new ApiError(400, "Product not found");
        }

        return res.status(200).json(new ApiResponse(200, product, "Product data"));
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to get product");
    }
});

// Create a new product & add to store's products array
const createProduct = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            company,
            quantity,
            price,
            description,
            offerPercentage,
            category,
            content
        } = req.body;

        const { storeId } = req.params;

        if (!name || !company || !description || !storeId) {
            throw new ApiError(400, "Name, company, description, and storeId are required");
        }

        const store = await Store.findById(storeId);
        if (!store) {
            throw new ApiError(400, "Store not found");
        }

        // Parse content if it's a string (from FormData)
        let parsedContent = {};
        if (content) {
            try {
                parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
            } catch (error) {
                console.warn("Failed to parse content:", error);
                parsedContent = {};
            }
        }

        // Ensure content has default structure
        const productContent = {
            activeIngredients: parsedContent.activeIngredients || [],
            targetPests: parsedContent.targetPests || [],
            usageAreas: parsedContent.usageAreas || [],
            instructions: parsedContent.instructions || "",
            precautions: parsedContent.precautions || ""
        };

        const product = await Product.create({
            name,
            company,
            quantity: quantity ? Number(quantity) : 0,
            price: price ? Number(price) : 0,
            description,
            offerPercentage: offerPercentage ? Number(offerPercentage) : 0,
            category: category || "",
            content: productContent,
            store: storeId
        });

        // Handle image upload
        if (req.file) {
            const localPath = req.file.path;
            const productImg = await uploadOnCloudinary(localPath);
            if (productImg) {
                product.img = {
                    public_id: productImg.public_id,
                    secure_url: productImg.secure_url,
                };
                await product.save();
            }
        }

        // Add product to store's products array
        store.products.push(product._id);
        await store.save();

        return res
            .status(200)
            .json(new ApiResponse(200, product, "Product created and added to store successfully"));
    } catch (error) {
        console.error("Create product error:", error);
        throw new ApiError(400, error.message || "Failed to create product");
    }
});

// Update product and store reference if storeId is changed
const updateProduct = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            name,
            company,
            quantity,
            price,
            description,
            offerPercentage,
            category,
            content
        } = req.body;

        console.log(req.body)

        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            throw new ApiError(400, "Product not found");
        }

        // Parse content if it's a string (from FormData)
        let parsedContent = {};
        if (content) {
            try {
                parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
            } catch (error) {
                console.warn("Failed to parse content:", error);
                parsedContent = existingProduct.content || {};
            }
        } else {
            parsedContent = existingProduct.content || {};
        }

        // Prepare update data
        const updateData = {
            name: name || existingProduct.name,
            company: company || existingProduct.company,
            quantity: quantity !== undefined ? Number(quantity) : existingProduct.quantity,
            price: price !== undefined ? Number(price) : existingProduct.price,
            description: description || existingProduct.description,
            offerPercentage: offerPercentage !== undefined ? Number(offerPercentage) : existingProduct.offerPercentage,
            category: category !== undefined ? category : existingProduct.category,
            content: {
                activeIngredients: parsedContent.activeIngredients || existingProduct.content?.activeIngredients || [],
                targetPests: parsedContent.targetPests || existingProduct.content?.targetPests || [],
                usageAreas: parsedContent.usageAreas || existingProduct.content?.usageAreas || [],
                instructions: parsedContent.instructions !== undefined ? parsedContent.instructions : existingProduct.content?.instructions || "",
                precautions: parsedContent.precautions !== undefined ? parsedContent.precautions : existingProduct.content?.precautions || ""
            }
        };

        // Handle image update
        if (req.file) {
            const localPath = req.file.path;
            const productImg = await uploadOnCloudinary(localPath);
            if (productImg) {
                updateData.img = {
                    public_id: productImg.public_id,
                    secure_url: productImg.secure_url,
                };
            }
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        );

        console.log("updatedProduct", updatedProduct)

        return res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
    } catch (error) {
        console.error("Update product error:", error);
        throw new ApiError(400, error.message || "Failed to update product");
    }
});

// Delete product & remove from store's products array
const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(400, "Product not found");
        }

        const storeId = product.store.toString();

        // Remove from store's products array
        const store = await Store.findById(storeId);
        if (store) {
            store.products = store.products.filter(prodId => prodId.toString() !== productId);
            await store.save();
        }

        // Delete product
        await Product.findByIdAndDelete(productId);

        return res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));

    } catch (error) {
        throw new ApiError(400, error.message || "Failed to delete product");
    }
});

const getProductByStoreId = asyncHandler(async (req, res) => {
    try {
        const { storeId } = req.params;

        const products = await Product.find({ store: storeId })
            .sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(200, products, "Product data"));
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to get products by store ID");
    }
});

const changeStockStatus = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        console.log("productId", productId);

        const product = await Product.findById(productId);

        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        // Toggle stock status
        const newOutOfStockStatus = !product.outOfStock;
        product.outOfStock = newOutOfStockStatus;

        // If marking as out of stock, set quantity to 0
        if (newOutOfStockStatus) {
            product.quantity = 0;
        }

        await product.save();

        res.status(200).json(
            new ApiResponse(200, product, "Product stock status updated successfully")
        );
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to change stock status");
    }
});

const updateProductQuantity = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || isNaN(quantity) || quantity < 0) {
            throw new ApiError(400, "Provide a valid quantity more than 0");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(400, "Product not found");
        }

        // Update quantity
        product.quantity = quantity;
        // Auto-set outOfStock based on quantity
        product.outOfStock = quantity <= 0;

        const updatedProduct = await product.save();

        return res.status(200).json(
            new ApiResponse(200, updatedProduct, "Product quantity updated successfully")
        );
    } catch (error) {
        console.error("Error updating quantity:", error);
        throw new ApiError(400, error.message || "Failed to update product quantity");
    }
});

// New function to search products by category
const getProductsByCategory = asyncHandler(async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const products = await Product.find({ category: category })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("store", "name");

        const totalCount = await Product.countDocuments({ category: category });

        return res.status(200).json(new ApiResponse(200, {
            products,
            totalCount,
            category
        }, `Products in ${category} category`));
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to get products by category");
    }
});

// New function to search products by target pests
const getProductsByTargetPest = asyncHandler(async (req, res) => {
    try {
        const { pest } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const products = await Product.find({
            "content.targetPests": { $in: [new RegExp(pest, 'i')] }
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("store", "name");

        const totalCount = await Product.countDocuments({
            "content.targetPests": { $in: [new RegExp(pest, 'i')] }
        });

        return res.status(200).json(new ApiResponse(200, {
            products,
            totalCount,
            targetPest: pest
        }, `Products targeting ${pest}`));
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to get products by target pest");
    }
});

// New function to get all unique categories
const getProductCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        const validCategories = categories.filter(cat => cat && cat.trim() !== "");

        return res.status(200).json(new ApiResponse(200, validCategories, "Product categories"));
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to get product categories");
    }
});

export {
    getAllProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByStoreId,
    changeStockStatus,
    updateProductQuantity,
    getProductsByCategory,
    getProductsByTargetPest,
    getProductCategories,
};
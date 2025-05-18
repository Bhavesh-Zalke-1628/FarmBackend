import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Product from "../Model/productModel.js";
import Store from "../Model/storemodel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all products
const getAllProduct = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({});
        if (!products || products.length === 0) {
            throw new ApiError(400, "No products found");
        }

        return res.status(200).json(new ApiResponse(200, products, "Product data"));
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
        console.log(req.body)
        const { name, company, quantity, price, description } = req.body.productData;
        const { storeId } = req.params;

        if (!name || !company || !description || !storeId) {
            throw new ApiError(400, "Name, company, description, and storeId are required");
        }

        const store = await Store.findById(storeId);
        if (!store) {
            throw new ApiError(400, "Store not found");
        }

        const product = await Product.create({
            name,
            company,
            quantity,
            price,
            description,
            store: storeId
        });

        // if (req.file) {
        //     const localPath = req.file.path;
        //     const productImg = await uploadOnCloudinary(localPath);
        //     product.img = {
        //         public_id: productImg.public_id,
        //         secure_url: productImg.secure_url,
        //     };
        //     await product.save();
        // }

        store.products.push(product._id);
        await store.save();

        return res
            .status(200)
            .json(new ApiResponse(200, product, "Product created and added to store successfully"));
    } catch (error) {
        throw new ApiError(400, error.message || "Failed to create product");
    }
});


// Update product and store reference if storeId is changed
const updateProduct = asyncHandler(async (req, res) => {
    try {

        const { productId } = req.params;
        const { name, company, quantity, } = req.body;

        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            throw new ApiError(400, "Product not found");
        }

        // If storeId is changed, update store reference
        // if (storeId && storeId !== existingProduct.store?.toString()) {
        //     const oldStore = await Store.findOne({ products: productId });

        //     if (oldStore) {
        //         oldStore.products = oldStore.products.filter(prodId => prodId.toString() !== id);
        //         await oldStore.save();
        //     }

        //     const newStore = await Store.findById(storeId);
        //     if (!newStore) {
        //         throw new ApiError(400, "New store not found");
        //     }
        //     newStore.products.push(id);
        //     await newStore.save();
        // }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { name, company, quantity },
            { new: true }
        );

        return res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
    } catch (error) {
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

const getProductByStoreId = asyncHandler(async () => {
    const { storeId } = req.params
    if (!storeId) {
        throw new ApiError(4040, "Store id not mentaioned")
    }

})

export {
    getAllProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByStoreId
};

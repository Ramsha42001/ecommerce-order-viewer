import {
    getAllProductsService,
    // getProductByIdService,
    // createProductService,
    // updateProductService,
    // deleteProductService,
    // debugProductCollection
} from '../services/productService.js';

// Debugging function to check the connection and collection
export const debugProductCollectionController = async (req, res) => {
    try {
        await debugProductCollection();
        res.status(200).json({ message: 'Debugging information logged to console.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await getAllProductsService();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product by ID
// export const getProductById = async (req, res) => {
//     try {
//         const product = await getProductByIdService(req.params.id);
//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         res.json(product);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Create a new product
// export const createProduct = async (req, res) => {
//     try {
//         const savedProduct = await createProductService(req.body);
//         res.status(201).json(savedProduct);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Update a product
// export const updateProduct = async (req, res) => {
//     try {
//         const updatedProduct = await updateProductService(req.params.id, req.body);
//         if (!updatedProduct) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         res.json(updatedProduct);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Delete a product
// export const deleteProduct = async (req, res) => {
//     try {
//         const deletedProduct = await deleteProductService(req.params.id);
//         if (!deletedProduct) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         res.json({ message: 'Product deleted' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
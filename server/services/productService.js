import Product from '../models/Product.js';
export const getAllProductsService = async () => {
    try {
        const products = await Product.find();
        console.log('Products returned by Mongoose:', products); // Log the actual products
        console.log('Number of products:', products.length); // Log the count of products

        return products;
    } catch (error) {
        console.error('Debug error:', error);
        throw error;
    }
};
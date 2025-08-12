// server/models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    cost: { type: Number, required: true },
    category: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    retail_price: { type: Number, required: true },
    department: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    distribution_center_id: { type: Number, required: true }
});

// Create the Product model
const Product = mongoose.model('Product', ProductSchema);

// Export the Product model
export default Product;
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    order_id: { type: Number, required: true, unique: true },
    user_id: { type: Number, required: true },
    status: { type: String, required: true },
    gender: { type: String, required: true },
    created_at: { type: Date, required: true },
    num_of_item: { type: Number, required: true }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
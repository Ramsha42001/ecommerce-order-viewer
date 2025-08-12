import Order from '../models/Order.js';
import mongoose from 'mongoose';

export const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            status,
            userId,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            search
        } = req.query;


        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (userId) {
            filter.userId = userId;
        }

        // Filter by amount range
        if (minAmount || maxAmount) {
            filter.totalAmount = {};
            if (minAmount) filter.totalAmount.$gte = Number(minAmount);
            if (maxAmount) filter.totalAmount.$lte = Number(maxAmount);
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Search in order number or customer details
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customerInfo.name': { $regex: search, $options: 'i' } },
                { 'customerInfo.email': { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const orders = await Order.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'first_name last_name email') // If you have user references
            .lean(); // For better performance

        // Get total count for pagination
        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / Number(limit));

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalOrders,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1,
                limit: Number(limit)
            },
            filter: filter
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get order by ID (supports both MongoDB _id and custom id field)
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        let order;

        // Try MongoDB ObjectId first
        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id)
                .populate('userId', 'first_name last_name email');
        }

        // If not found and ID is numeric, try custom id field
        if (!order && !isNaN(id)) {
            order = await Order.findOne({ id: Number(id) })
                .populate('userId', 'first_name last_name email');
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get orders by user ID
export const getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 10, page = 1 } = req.query;

        const filter = { userId: Number(userId) };
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const totalOrders = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalOrders / Number(limit)),
                totalOrders
            }
        });
    } catch (error) {
        console.error('Get orders by user ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user orders',
            error: error.message
        });
    }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageOrderValue: { $avg: '$totalAmount' },
                    maxOrderValue: { $max: '$totalAmount' },
                    minOrderValue: { $min: '$totalAmount' }
                }
            }
        ]);

        // Orders by status
        const statusStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentOrdersCount = await Order.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                overview: stats[0] || {},
                statusBreakdown: statusStats,
                recentOrders: recentOrdersCount
            }
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order statistics',
            error: error.message
        });
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['userId', 'items', 'totalAmount'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate items array
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        // Add order metadata
        const orderData = {
            ...req.body,
            orderNumber: `ORD-${Date.now()}`, // Generate order number
            status: req.body.status || 'pending',
            createdAt: new Date()
        };

        const order = new Order(orderData);
        const savedOrder = await order.save();

        res.status(201).json({
            success: true,
            data: savedOrder,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Create order error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// Update an order
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Add updated timestamp
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        let updatedOrder;

        // Try MongoDB ObjectId first
        if (mongoose.Types.ObjectId.isValid(id)) {
            updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            });
        }

        // If not found and ID is numeric, try custom id field
        if (!updatedOrder && !isNaN(id)) {
            updatedOrder = await Order.findOneAndUpdate(
                { id: Number(id) },
                updateData,
                { new: true, runValidators: true }
            );
        }

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: updatedOrder,
            message: 'Order updated successfully'
        });
    } catch (error) {
        console.error('Update order error:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: error.message
        });
    }
};

// Delete an order
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        let deletedOrder;

        // Try MongoDB ObjectId first
        if (mongoose.Types.ObjectId.isValid(id)) {
            deletedOrder = await Order.findByIdAndDelete(id);
        }

        // If not found and ID is numeric, try custom id field
        if (!deletedOrder && !isNaN(id)) {
            deletedOrder = await Order.findOneAndDelete({ id: Number(id) });
        }

        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully',
            data: { id: deletedOrder._id }
        });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
};

// Search orders by multiple criteria
export const searchOrders = async (req, res) => {
    try {
        const { q, fields = 'orderNumber,customerInfo.name,customerInfo.email' } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchFields = fields.split(',');
        const searchConditions = searchFields.map(field => ({
            [field]: { $regex: q, $options: 'i' }
        }));

        const orders = await Order.find({
            $or: searchConditions
        }).limit(20);

        res.json({
            success: true,
            data: orders,
            searchQuery: q,
            resultCount: orders.length
        });
    } catch (error) {
        console.error('Search orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching orders',
            error: error.message
        });
    }
};
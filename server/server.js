import express from 'express';
import connectDB from './db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoute.js';
import productRoutes from './routes/productRoute.js' // Import product routes

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
dotenv.config();
connectDB();

app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes); // Use order routes
app.use('/api/products', productRoutes); // Use product routes

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
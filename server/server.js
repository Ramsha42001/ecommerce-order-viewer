import express from 'express'
import connectDB from './db.js';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
dotenv.config()
connectDB()



app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
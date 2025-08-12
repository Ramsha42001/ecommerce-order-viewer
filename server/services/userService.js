
import User from '../models/User.js';


export const getAllUsers = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw new Error('Error fetching users: ' + error.message);
    }
};

export const getUserById = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw new Error('Error fetching user: ' + error.message);
    }
};
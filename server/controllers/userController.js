import { getAllUsers, fetchUserById } from "../services/userService";

export const fetchAllUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


export const fetchUserById = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(404).json({ message: error.message });
    }
};
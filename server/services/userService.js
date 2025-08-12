import User from '../models/User.js';
import mongoose from 'mongoose';

// Debug version of getAllUsersService
export const getAllUsersService = async () => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        const mongooseCount = await User.countDocuments();
        const rawCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log('Documents in raw "users" collection:', rawCount);

        const possibleCollections = ['users', 'Users', 'user', 'User'];
        for (const collName of possibleCollections) {
            try {
                const count = await mongoose.connection.db.collection(collName).countDocuments();
                if (count > 0) {
                    console.log(`Found ${count} documents in collection: ${collName}`);
                }
            } catch (error) {

            }
        }

        // Step 6: Get one document using raw driver to see structure
        const sampleDoc = await mongoose.connection.db.collection('users').findOne();
        console.log('Sample document from raw collection:', sampleDoc);

        // Step 7: Try to fetch using Mongoose
        const users = await User.find();
        console.log('Users returned by Mongoose:', users.length);

        // Step 8: If no users found, try with different approaches
        if (users.length === 0) {
            console.log('Trying alternative queries...');

            // Try limiting the query
            const limitedUsers = await User.find().limit(5);
            console.log('Limited query result:', limitedUsers.length);

            // Try with specific field selection
            const usersWithFields = await User.find({}, 'id first_name email').limit(5);
            console.log('Query with field selection:', usersWithFields);
        }

        return users;

    } catch (error) {
        console.error('Debug error:', error);
        throw error;
    }
};

export const fetchUserByIdService = async (id) => {
    try {

        let user = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            console.log('Trying MongoDB _id search...');
            user = await User.findById(id);
            console.log('Found via _id:', !!user);
        }

        if (!user) {
            console.log('Trying custom id field search...');
            const numericId = parseInt(id);
            if (!isNaN(numericId)) {
                user = await User.findOne({ id: numericId });
                console.log('Found via custom id:', !!user);
            }
        }


        if (!user) {
            console.log('Trying string id search...');
            user = await User.findOne({ id: id });
            console.log('Found via string id:', !!user);
        }

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        console.error('fetchUserByIdService error:', error);
        throw new Error('Error fetching user: ' + error.message);
    }
};

// Additional debug function to check connection
export const debugConnection = async () => {
    try {
        console.log('=== CONNECTION DEBUG ===');
        console.log('Mongoose connection state:', mongoose.connection.readyState);
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        console.log('Connection status:', states[mongoose.connection.readyState]);
        console.log('Host:', mongoose.connection.host);
        console.log('Port:', mongoose.connection.port);
        console.log('Database:', mongoose.connection.name);

        if (mongoose.connection.readyState === 1) {
            // Test a simple operation
            const adminDb = mongoose.connection.db.admin();
            const result = await adminDb.ping();
            console.log('Database ping successful:', result);
        }

    } catch (error) {
        console.error('Connection debug error:', error);
    }
};

// Function to check your specific collection structure
export const debugUserCollection = async () => {
    try {
        console.log('=== USER COLLECTION DEBUG ===');

        // Get collection stats
        const stats = await mongoose.connection.db.collection('users').stats();
        console.log('Collection stats:', {
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize
        });

        // Get first few documents to check structure
        const sampleDocs = await mongoose.connection.db.collection('users').find().limit(3).toArray();
        console.log('Sample documents:', sampleDocs);

        // Check indexes
        const indexes = await mongoose.connection.db.collection('users').indexes();
        console.log('Collection indexes:', indexes);

    } catch (error) {
        console.error('Collection debug error:', error);
    }
};
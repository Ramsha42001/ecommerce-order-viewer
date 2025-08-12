import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    state: { type: String, required: true },
    street_address: { type: String, required: true },
    postal_code: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    traffic_source: { type: String, required: true },
    created_at: { type: Date, required: true }
}, {
    collection: 'users'
});

const User = mongoose.model('User', userSchema);
export default User;
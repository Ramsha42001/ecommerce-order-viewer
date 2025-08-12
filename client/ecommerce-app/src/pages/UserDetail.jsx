// src/pages/UserDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const UserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/users/${id}`);
                if (!response.ok) throw new Error('Failed to fetch user');
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>{user.first_name} {user.last_name}</h1>
            <p>Email: {user.email}</p>
            <p>Age: {user.age}</p>
            <p>Location: {user.city}, {user.state}</p>
        </div>
    );
};

export default UserDetail;
// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
// import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <nav >
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/users">All Users</Link>
                </li>
                <li>
                    <Link to="/inventory">Inventory Items</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
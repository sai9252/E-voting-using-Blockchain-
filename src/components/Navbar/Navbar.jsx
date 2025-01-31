import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    console.log(user);
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-gray-800 p-4">
            <ul className="flex justify-between items-center">
                <li className='p-3 text-white text-2xl font-bold ml-10'>
                    E-VOTING
                </li>
                {!user && (
                    <>
                    <div className='flex flex-row space-x-10 p-3 mr-30'>
                        <li>
                            <Link to="/" className="text-white px-4 py-2 text-lg">Login</Link>
                        </li>
                        <li>
                            <Link to="/admin-login" className="text-white px-4 py-2 text-lg">Admin Login</Link>
                        </li>
                        </div>
                    </>
                )}
                {user && user.role === 'VOTER' && (
                    <>
                        <li>
                            <Link to="/vote" className="text-white px-4 py-2 text-lg">Vote</Link>
                        </li>
                        <li>
                            <Link to="/results" className="text-white px-4 py-2 text-lg">Results</Link>
                        </li>
                    </>
                )}
                {user && user.role === 'ADMIN' && (
                    <>
                        <li>
                            <Link to="/register" className="text-white px-4 py-2 text-lg">Add Voters</Link>
                        </li>
                        <li>
                            <Link to="/add-candidates" className="text-white px-4 py-2 text-lg">Add Candidates</Link>
                        </li>
                        <li>
                            <Link to="/results" className="text-white px-4 py-2 text-lg">Results</Link>
                        </li>
                    </>
                )}
                {user && (
                    <li className="pr-8">
                        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 text-lg rounded hover:bg-red-700 ">
                            Logout
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
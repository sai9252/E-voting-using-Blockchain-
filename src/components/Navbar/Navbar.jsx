import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { RiIdCardFill } from 'react-icons/ri';

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
                    {user && user?.userId ? <a href={`/user-dashboard?id=${user.userId}`}>
                    E-VOTING
                    </a> : <a href='/admin-dashboard'>E-VOTING</a>}
                </li>
                {!user && (
                    <>
                    <div className='flex flex-row space-x-10 p-3 mr-30'>
                        <li>
                            <Link to="/login" className="text-white px-4 py-2 text-lg">Login</Link>
                        </li>
                        <li>
                            <Link to="/admin-login" className="text-white px-4 py-2 text-lg">Admin Login</Link>
                        </li>
                        </div>
                    </>
                )}
                {user && user.role === 'VOTER' && (
                    <>
                    <div className='flex -flex-col space-x-3'>
                        <h1 className='text-4xl text-pink-500 font-serif'>Welcome, Voter </h1>
                        <i className="ri-id-card-fill flex items-center"> <RiIdCardFill size={36} color="white"/></i>
                        </div>
                    </>
                )}
                {user && user.role === 'ADMIN' && (
                    <>
                        <li>
                            <Link to="/admin-dashboard" className="text-white px-4 py-2 text-lg">Verify Voters</Link>
                        </li>
                        <li>
                            <Link to="/election-dashboard" className="text-white px-4 py-2 text-lg">Add Elections/Results</Link>
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
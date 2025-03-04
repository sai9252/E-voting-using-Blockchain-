import { useContext } from 'react';
import { RiIdCardFill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../AuthContext';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = () => {

        logout();
        navigate("/login")

        // Show toast and navigate after it closes
        toast.success('Logout successful', {
            autoClose: 1000
        });
    };

    return (
        <nav className="navbar p-5 rounded-2xl">
            <ul className="flex justify-between items-center">
                <li className='p-3 bg-gradient-to-br from-white via-cyan-300 to-blue-700 bg-clip-text text-transparent text-4xl font-bold ml-10'>
                    {user && user?.userId ?
                        <a href={`/user-dashboard?id=${user.userId}`}>
                            E-VOTING
                        </a>
                        :
                        <a href='/admin-dashboard' className='flex flex-col'>
                            E-VOTING
                            <span className='text-sm flex justify-center'>using blockChain</span>
                        </a>
                    }
                </li>
                {!user && (
                    <>
                        <div className='flex flex-row space-x-16 p-3 mr-30'>
                            <li>
                                <Link to="/login" className="bg-gradient-to-br from-white via-cyan-200 to-blue-700 bg-clip-text text-transparent text-2xl font-bold hover:border-b-2 hover:border-b-cyan-300">Login</Link>
                            </li>
                            <li>
                                <Link to="/admin-login" className="bg-gradient-to-br from-white via-cyan-200 to-blue-700 bg-clip-text text-transparent text-2xl font-bold hover:border-b-2 hover:border-b-cyan-300">Admin Login</Link>
                            </li>
                        </div>
                    </>
                )}
                {user && user.role === 'VOTER' && (
                    <>
                        <div className='flex mr-20 space-x-3 items-center'>
                            <h1 className='text-4xl text-pink-500 '>Welcome, Voter</h1>
                            <RiIdCardFill size={36} color="white" />
                        </div>
                    </>
                )}
                {user && user.role === 'ADMIN' && (
                    <>
                        <li>
                            <Link to="/admin-dashboard" className="bg-gradient-to-br from-white via-cyan-200 to-blue-700 bg-clip-text text-transparent text-2xl font-bold px-4 py-2 hover:border-b-4 hover:border-b-cyan-600">Verify Voters</Link>
                        </li>
                        <li>
                            <Link to="/election-dashboard" className="bg-gradient-to-br from-white via-cyan-200 to-blue-700 bg-clip-text text-transparent text-2xl font-bold px-4 py-2 hover:border-b-4 hover:border-b-cyan-600">Add Elections/Results</Link>
                        </li>
                    </>
                )}
                {user && (
                    <li className="mr-20">
                        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 text-lg rounded hover:bg-red-700">
                            Logout
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
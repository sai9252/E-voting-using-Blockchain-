import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [formData, setFormData] = useState({
        aadhar: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('registrationSuccess') === 'true') {
            toast.success('Registration successful');
        }
    }, [location.search]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate form fields
        if (!formData.aadhar || !formData.password) {
            toast.error("Please fill all fields");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                const token = data.token;
                localStorage.setItem('token', token);
                const user = data.user;
                localStorage.setItem('user', JSON.stringify(user));

                login({ ...data.user });

                navigate(`/user-dashboard?id=${user.userId}&loginSuccess=true`);
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen ">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
                <ToastContainer position="top-center" autoClose={2000} />
                <form id="loginForm" className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="aadhar"
                        placeholder="Aadhar Number"
                        className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                        value={formData.aadhar}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {loading ? (
                        <p className="text-gray-700 flex items-center justify-center text-2xl">Loading ...</p>
                    ) : (
                        <button type="submit" className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">
                            Login
                        </button>
                    )}
                    <div className="text-center mt-4">
                        Dont have an account?&nbsp;
                        <a href="/" className="text-blue-500 hover:text-blue-700">
                            Register
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
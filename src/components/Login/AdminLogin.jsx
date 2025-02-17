// AdminLogin.js
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/adminlogin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                console.log(data)
                const token = data.token;
                localStorage.setItem('token', token);
                const user = data.user;
                console.log('AdminLogin user:', user);
                localStorage.setItem('user', JSON.stringify(user));

                login({ ...data.user });

                navigate(`/admin-dashboard?id=${user.adminId}`);
                
                // alert(data.message);
                // Redirect to dashboard or home page
            } else {
                alert(data.message || 'AdminLogin failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('AdminLogin failed');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
                <form id="AdminLoginForm" className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="email"
                        placeholder="Email"
                        required
                        className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        required
                        className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {loading ? <p className="text-gray-700 flex items-center justify-center text-2xl">Loading ...</p>
                    :<button type="submit" className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">
                        Admin Login
                    </button>}
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
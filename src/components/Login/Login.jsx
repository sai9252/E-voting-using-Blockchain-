// Login.js
import { useContext,useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const [formData, setFormData] = useState({
        aadhar: '',
        password: '',
    });
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log(data)
                const token = data.token;
                localStorage.setItem('token', token);
                const user = data.user;
                console.log('Login user:', user);
                localStorage.setItem('user', JSON.stringify(user));

                login({ ...data.user });

                navigate(`/user-dashboard?id=${user.userId}`)

                alert(data.message);
                // Redirect to dashboard or home page
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Login failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-500 to-orange-500">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
                <form id="loginForm" className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="aadhar"
                        placeholder="Aadhar Number"
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={formData.aadhar}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <button type="submit" className="w-full p-3 bg-pink-500 text-white font-bold rounded hover:bg-pink-600">
                        Login
                    </button>
                    <div className="text-center mt-4">Dont have an account?&nbsp;
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
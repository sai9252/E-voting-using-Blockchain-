
import { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        aadhar: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setFormData({   // Clear the form
                    name: '',
                    email: '',
                    aadhar: '',
                    password: '',
                });
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-500 to-orange-500 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Voters Registration</h2>
                <form id="registerForm" className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="name"
                        placeholder="Full Name"
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        required
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={formData.email}
                        onChange={handleChange}
                    />
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
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
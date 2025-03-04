import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhoneInput from 'react-phone-number-input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-phone-number-input/style.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', aadhar: '', password: '', dateOfBirth: '',
        phoneNumber: '', aadharDocs: null, voterId: null
    });
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [fileNames, setFileNames] = useState({ aadhar: '', voter: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value, files } = e.target;
        if (files) {
            const file = files[0];
            setFileNames(prev => ({
                ...prev,
                [id === 'aadharDocs' ? 'aadhar' : 'voter']: file?.name || ''
            }));
            setFormData(prev => ({ ...prev, [id]: file }));
        } else if (id === 'aadhar') {
            setFormData(prev => ({ ...prev, [id]: value.substring(0, 12) }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSendOtp = async () => {

        if (!formData.phoneNumber) {
            toast.error('Please enter a valid phone number');
            return;
        }
        try {
            const checkResponse = await axios.post('http://localhost:5000/api/check-phone', {
                phoneNumber: formData.phoneNumber
            });

            if (checkResponse.data.exists) {
                toast.error('Phone number already registered');
                return;
            }
            await axios.post('http://localhost:5000/api/send-otp', { phoneNumber: formData.phoneNumber });
            setOtpSent(true);
            toast.success('OTP sent successfully');

        } catch (error) {
            toast.error(error.response?.data?.message || 'failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error('Please enter OTP');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/verify-otp', { phoneNumber: formData.phoneNumber, otp });
            setIsPhoneVerified(true);
            toast.success('Phone number verified successfully');
            setOtpSent(false);
            setOtp('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP verification failed');
        }
    };

    const validateForm = () => {
        const requiredFields = ['name', 'email', 'aadhar', 'password', 'dateOfBirth',
            'phoneNumber', 'aadharDocs', 'voterId'];
        const emptyFields = requiredFields.filter(field => !formData[field]);

        if (emptyFields.length > 0) {
            toast.error(`Please fill all required fields: ${emptyFields.join(', ')}`);
            return false;
        }
        if (!isPhoneVerified) {
            toast.error('Please verify your phone number');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        // Validate form fields
        if (!formData.aadhar || !formData.password || !formData.name || !formData.email|| !formData.phoneNumber|| !formData.dateOfBirth|| !formData.aadharDocs|| !formData.voterId) {
            toast.error("Please fill all fields");
            setLoading(false);
            return;
        }
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });

            await axios.post('http://localhost:5000/api/register', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData({
                name: '', email: '', aadhar: '', password: '', dateOfBirth: '',
                phoneNumber: '', aadharDocs: null, voterId: null
            });
            navigate('/login?registrationSuccess=true');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-[45rem]">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Voters Registration</h2>
                <ToastContainer position="top-right" autoClose={2000} />
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className='flex space-x-4 justify-between h-[18rem]'>
                        <div className='flex flex-col justify-between space-y-3 w-1/2'>
                            {/* Basic Info Inputs */}
                            <input type="text" id="name" placeholder="Full Name"
                                className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                value={formData.name} onChange={handleChange} />
                            <input type="email" id="email" placeholder="Email"
                                className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                value={formData.email} onChange={handleChange} />

                            {/* Phone Input */}
                            <div className="flex space-x-2">
                                <PhoneInput international defaultCountry='IN' id="phoneNumber" placeholder="Phone Number"
                                    className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                    value={formData.phoneNumber} onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                                    disabled={isPhoneVerified} />
                                {!isPhoneVerified && formData.phoneNumber && (
                                    <button type="button" onClick={handleSendOtp}
                                        className="p-2 bg-blue-500 text-white rounded-lg h-10 mt-1 flex items-center">
                                        Verify
                                    </button>
                                )}
                            </div>

                            {/* OTP Input */}
                            {otpSent && (
                                <div className="flex space-x-2">
                                    <input type="text" placeholder="Enter OTP" value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full p-1 border border-gray-400 rounded" />
                                    <button type="button" onClick={handleVerifyOtp}
                                        className="p-1 bg-green-500 text-white rounded-lg h-10 w-40 flex items-center justify-center">
                                        Submit OTP
                                    </button>
                                </div>
                            )}

                            <input type="text" id="aadhar" placeholder="Aadhar Number"
                                className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                value={formData.aadhar} onChange={handleChange} />
                        </div>

                        {/* Right Column */}
                        <div className='flex flex-col justify-between'>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
                                <input type="date" id="dateOfBirth" 
                                    className="w-full p-3 border border-gray-400 text-gray-400 rounded focus:outline-none focus:border-blue-500"
                                    value={formData.dateOfBirth} onChange={handleChange} />
                            </div>

                            {/* File Uploads */}
                            {['aadharDocs', 'voterId'].map((id) => (
                                <div key={id}>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        {id === 'aadharDocs' ? 'Aadhar Document' : 'Voter ID Document'}
                                    </label>
                                    <div className="relative w-80 h-12">
                                        <input type="file" id={id} accept=".pdf,.jpg,.jpeg,.png" 
                                            className="absolute opacity-0 w-full h-full cursor-pointer"
                                            onChange={handleChange} />
                                        <div className="w-full p-3 border border-gray-400 text-gray-400 rounded focus:outline-none focus:border-blue-500 bg-white cursor-pointer">
                                            {fileNames[id === 'aadharDocs' ? 'aadhar' : 'voter'] || `Upload ${id === 'aadharDocs' ? 'Aadhar' : 'Voter ID'} Document`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <input type="password" id="password" placeholder="Password" 
                            className="w-80 p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                            value={formData.password} onChange={handleChange} />
                    </div>

                    {/* Submit Button */}
                    {loading ?
                        <p className="text-gray-700 flex items-center justify-center text-2xl">Loading ...</p> :
                        <button type="submit" className="w-full p-3 text-white font-bold rounded bg-blue-500 hover:bg-blue-600">
                            Register
                        </button>
                    }

                    <div className="text-center">
                        Already have an account? &nbsp;
                        <a href="/login" className="text-blue-500 hover:text-blue-700">Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
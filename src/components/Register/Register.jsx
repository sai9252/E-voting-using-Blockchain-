import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        aadhar: '',
        password: '',
        dateOfBirth: '',
        phoneNumber: '',
        aadharDocs: null,
        voterId: null,
    });

    const [loading, setLoading] = useState(false);
    const [aadharFileName, setAadharFileName] = useState("");
    const [voterIdFileName, setVoterIdFileName] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value, files } = e.target;
        if (id === 'aadharDocs') {
            const file = files[0];
            setAadharFileName(file ? file.name : "");
            setFormData({ ...formData, aadharDocs: file || null });
        } else if (id === 'voterId') {
            const file = files[0];
            setVoterIdFileName(file ? file.name : "");
            setFormData({ ...formData, voterId: file || null });
        } else if (id === 'aadhar') {
            setFormData({ ...formData, [id]: value.length > 12 ? value.substring(0, 12) : value || null });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleSendOtp = async () => {
        if (!formData.phoneNumber) {
            setVerificationStatus({ success: false, message: 'Please enter a valid phone number' });
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/send-otp', { phoneNumber: formData.phoneNumber });
            if (response.status === 200) {
                setOtpSent(true);
                setVerificationStatus({ success: true, message: 'OTP sent successfully' });
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setVerificationStatus({ success: false, message: error.response.data.message });
            } else {
                setVerificationStatus({ success: false, message: 'Failed to send OTP' });
            }
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post('http://localhost:5000/verify-otp', { phoneNumber: formData.phoneNumber, otp });
            if (response.status === 200) {
                setIsPhoneVerified(true);
                setVerificationStatus({ success: true, message: 'Phone number is verified ✅' });
                setOtpSent(false);
                setOtp('');
            } else {
                setVerificationStatus({ success: false, message: 'Invalid OTP' });
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setVerificationStatus({ success: false, message: error.response.data.message });
            } else {
                setVerificationStatus({ success: false, message: otp ? 'OTP verification failed' : 'Enter a Valid OTP' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('aadhar', formData.aadhar);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('dateOfBirth', formData.dateOfBirth);
            formDataToSend.append('phoneNumber', formData.phoneNumber);
            formDataToSend.append('aadharDocs', formData.aadharDocs);
            formDataToSend.append('voterId', formData.voterId);

            const response = await axios.post('http://localhost:5000/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData(
                {
                    name: '',
                    email: '',
                    aadhar: '',
                    password: '',
                    dateOfBirth: '',
                    phoneNumber: '',
                    aadharDocs: null,
                    voterId: null,
                }
            )
            if (response.status === 200) {
                setRegistrationStatus({ success: true, message: response.data.message });
                navigate('/login');
            }
        } catch (error) {
            setRegistrationStatus({ success: false, message: error.response.data.message });

        }finally{
            setLoading(false);
        }
    };

    // Check if all required fields are filled and phone number is verified
    const isFormValid =
        formData.name &&
        formData.email &&
        formData.aadhar &&
        formData.password &&
        formData.dateOfBirth &&
        formData.phoneNumber &&
        formData.aadharDocs &&
        formData.voterId &&
        isPhoneVerified;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-[45rem]">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Voters Registration</h2>
                <form id="registerForm" className="space-y-4" onSubmit={handleSubmit}>
                    <div className='flex space-x-4 justify-between h-[18rem]'>
                        <div className='flex flex-col justify-between space-y-3 w-1/2'>
                            <input
                                type="text"
                                id="name"
                                placeholder="Full Name"
                                required
                                className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                required
                                className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            {/* 🔹 Phone Number Input with OTP Verification */}
                            <div className="flex space-x-2">
                                <PhoneInput
                                    international
                                    id="phoneNumber"
                                    placeholder="Phone Number"
                                    required
                                    defaultCountry='IN'
                                    className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                    value={formData.phoneNumber}
                                    onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
                                    disabled={isPhoneVerified}
                                />
                                {!isPhoneVerified && formData.phoneNumber && (
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="p-2 bg-blue-500 text-white rounded-lg h-10 mt-1 flex items-center"
                                    >
                                        Verify
                                    </button>
                                )}
                            </div>

                            {otpSent && (
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full p-1 border border-gray-400 rounded"
                                    />
                                    <button type="button" onClick={handleVerifyOtp} className="p-1 bg-green-500 text-white rounded-lg h-10 w-40 flex items-center justify-center">
                                        Submit OTP
                                    </button>
                                </div>
                            )}

                            {/* 🔹 Verification Status Message */}
                            {verificationStatus && (
                                <p className={`text-sm text-center ${verificationStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                                    {verificationStatus.message}
                                </p>
                            )}

                            <input
                                type="text"
                                id="aadhar"
                                placeholder="Aadhar Number"
                                required
                                className="w-full p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                                value={formData.aadhar}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='flex flex-col justify-between'>
                            <div >
                                <label htmlFor="dateOfBirth" className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    required
                                    className="w-full p-3 border border-gray-400 text-gray-400 rounded focus:outline-none focus:border-blue-500"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="aadharDocs" className="block text-gray-700 text-sm font-bold mb-2">
                                    Aadhar Document
                                </label>
                                <div className="relative w-80 h-12">
                                    <input
                                        type="file"
                                        id="aadharDocs"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                        className="absolute opacity-0 w-full h-full cursor-pointer"
                                        onChange={handleChange}
                                    />
                                    <div className="w-full p-3 border border-gray-400 text-gray-400 rounded focus:outline-none focus:border-blue-500 bg-white cursor-pointer">
                                        {aadharFileName || "Upload Aadhar Document"}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="voterId" className="block text-gray-700 text-sm font-bold mb-2">
                                    Voter ID Document
                                </label>
                                <div className="relative w-80 h-12">
                                    <input
                                        type="file"
                                        id="voterId"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                        className="absolute opacity-0 w-full h-full cursor-pointer"
                                        onChange={handleChange}
                                    />
                                    <div className="w-full p-3 border border-gray-400 text-gray-400 rounded focus:outline-none focus:border-blue-500 bg-white cursor-pointer">
                                        {voterIdFileName || "Upload Voter ID Document"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            required
                            className="w-80 p-3 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* 🔹 Registration Status Message */}
                    {registrationStatus && (
                        <p className={`text-sm text-center ${registrationStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                            {registrationStatus.message}
                        </p>
                    )}

                    {loading ? <p className="text-gray-700 flex items-center justify-center text-2xl">Loading ...</p>
                        : <button type="submit" disabled={!isFormValid} className={`w-full p-3 text-white font-bold rounded ${isFormValid ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}>
                            Register
                        </button>}
                    <div className="text-center">Already have an account? &nbsp;
                        <a href="/login" className="text-blue-500 hover:text-blue-700">
                            Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
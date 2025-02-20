import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OTPVerificationForm = () => {
    const [otp, setOTP] = useState('');
    const history = useNavigate();
    const location = useLocation();
    const { email, phoneNumber } = location.state || {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/verify-otp', { otp, phoneNumber });
            console.log(response);
            if (response.status == 200) {
                history('/dashboard', { state:{ phoneNumber }});
            } else {
                alert('Invalid OTP');
            }
        } catch (error) {
            console.error(error);
            alert(error?.response?.data.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Verify OTP</h2>
            <div>
                <label>OTP:</label>
                <input type="text" value={otp} onChange={(e) => setOTP(e.target.value)} required />
            </div>
            <button type="submit">Verify</button>
        </form>
    );
};

export default OTPVerificationForm;
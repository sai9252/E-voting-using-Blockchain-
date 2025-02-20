import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const RegistrationForm = () => {
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/send-otp', { email, phoneNumber });
            console.log(response);
            if (response.status === 200) {
                history('/otp-verification', { state: { email,phoneNumber } });
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert(error?.response.data.message);
            // alert('Failed to send OTP');
        }
    };

    return (
        <div className="registration-form-container">
            <form onSubmit={handleSubmit} className="registration-form">
                <h2>Register</h2>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number:</label>
                    <PhoneInput
                        international
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        className="phone-input"
                    />
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
};

export default RegistrationForm;
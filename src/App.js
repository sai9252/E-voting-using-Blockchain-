import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from './Components/RegistrationForm';
import OTPVerificationForm from './Components/OTPVerificationForm';
import Dashboard from './Components/Dashboard';
import Download from './Components/Download';
import "./App.css"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/download" element={<RegistrationForm />} />
        <Route path="/otp-verification" element={<OTPVerificationForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Download />} />
      </Routes>
    </Router>
  );
};

export default App;

import React from 'react';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
    const location = useLocation();
    const { phoneNumber } = location.state || {};

    return (
        <div>
            <h2>Welcome to your Dashboard</h2>
            <p>Phone Number: {phoneNumber}</p>
        </div>
    );
};

export default Dashboard;
import {Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString && JSON.parse(userString);

    console.log(user, token)

    if (!token || !user || user.role !== 'ADMIN') {
        return <Navigate to="/admin-login" replace />;
    }
    
    // Validate token
    try {
        console.log("protected route")
    } catch (err) {
        console.error('Invalid token:', err);
        return <Navigate to="/admin-login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
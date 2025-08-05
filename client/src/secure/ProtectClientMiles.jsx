import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';


export const ProtectClientMiles = ({ children }) => {
    const { profileRole } = useApp();
    const location = useLocation();

    if (profileRole !== 'super-admin' && profileRole !== 'admin') {
        // you can redirect to a “403” page or home
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

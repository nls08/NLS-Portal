// src/components/SuperAdminRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';


export const SuperAdminRoute = ({ children }) => {
    const { profileRole } = useApp();
    const location = useLocation();

    if (profileRole !== 'super-admin') {
        // you can redirect to a “403” page or home
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

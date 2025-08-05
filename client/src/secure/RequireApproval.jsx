import { Navigate, Outlet } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';


export function RequireApproval({ children }) {
    const { isLoaded, user } = useUser();
    const { isSignedIn } = useAuth();
    if (!isLoaded) return null;
    if (!isSignedIn) return <Outlet />;
    if (
        user.publicMetadata.role === 'super-admin' ||
        user.publicMetadata.role === 'admin'
    ) {
        return children || <Outlet />;
    }
    if (!user.publicMetadata.approved) {
        return <Navigate to="/verify" replace />;
    }
    return children || <Outlet />;
}
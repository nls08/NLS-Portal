import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function RequirePendingApproval({ children }) {
  const { isLoaded, user } = useUser();
  if (!isLoaded) return null;
  const isAdmin = user.publicMetadata.role === 'admin' || user.publicMetadata.role === 'super-admin';
  const isApproved = user.publicMetadata.approved;
  if (isAdmin || isApproved) {
    return <Navigate to="/" replace />;
  }
  return children;
}
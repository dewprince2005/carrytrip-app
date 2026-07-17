import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        gap: 'var(--space-4)'
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          Verifying session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

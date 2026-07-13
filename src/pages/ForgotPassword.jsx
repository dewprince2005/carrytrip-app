import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} />
            Back to Login
          </Link>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            <div className="logo" style={{ fontSize: '2rem', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
              Carrytrip
            </div>
            <h2 className="display-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Reset Password</h2>
            <p className="subtitle" style={{ marginBottom: 0 }}>We'll send recovery links to your registered email</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="alert alert-success" style={{ marginBottom: 'var(--space-6)' }}>
            <span>A password recovery link has been sent to <strong>{email}</strong>. Please check your inbox and spam folder.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: 'var(--space-3)', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)' 
                  }} 
                />
                <input
                  id="email"
                  type="email"
                  className={`form-input ${error ? 'error' : ''}`}
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending Link...
                </>
              ) : (
                <>
                  Send Recovery Link
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

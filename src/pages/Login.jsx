import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

// Google "G" SVG logo — official brand colours, no image needed
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email) { setError('Email address is required.'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return false; }
    if (!password) { setError('Password is required.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'Invalid login credentials') {
        setError('Incorrect email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Your email is unverified. Please check your inbox.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Supabase redirects to Google — no navigate() needed here.
      // The redirect back lands on /dashboard with a session.
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div className="logo" style={{ fontSize: '2rem', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
            Carrytrip
          </div>
          <h2 className="display-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome Back</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Sign in to continue matching route deliveries</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Google OAuth Button ─── */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-color)',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: 'var(--space-4)',
            fontFamily: 'inherit',
            opacity: googleLoading ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (!googleLoading) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {googleLoading ? (
            <><span className="spinner" style={{ width: '18px', height: '18px' }}></span> Connecting to Google...</>
          ) : (
            <><GoogleIcon /> Continue with Google</>
          )}
        </button>

        {/* ─── Divider ─── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span>or sign in with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* ─── Email / Password Form ─── */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
              />
              <input
                id="email"
                type="email"
                className={`form-input ${error && !email ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
              />
              <input
                id="password"
                type="password"
                className={`form-input ${error && !password ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 'var(--space-6)' }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner"></span> Authenticating...</>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        {/* ─── Signup link ─── */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

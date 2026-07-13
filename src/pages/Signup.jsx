import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Lock, CheckSquare, Square, AlertCircle, ArrowRight, Truck, Package } from 'lucide-react';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roles, setRoles] = useState([]); // can contain 'sender', 'carrier', or both
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Very Weak' });

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Calculate password strength dynamically
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Very Weak' });
      return;
    }

    let score = 0;
    
    // Length check
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    
    // Character type checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    const typesCount = [hasLowercase, hasUppercase, hasDigit, hasSpecial].filter(Boolean).length;
    
    if (typesCount >= 2 && password.length >= 6) score += 1;
    if (typesCount >= 3 && password.length >= 8) score += 1;

    let label = 'Very Weak';
    if (score === 1) label = 'Weak';
    else if (score === 2) label = 'Fair';
    else if (score === 3) label = 'Good';
    else if (score === 4) label = 'Strong';

    setPasswordStrength({ score, label });
  }, [password]);

  const toggleRole = (role) => {
    if (roles.includes(role)) {
      setRoles(roles.filter((r) => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Full name is required.');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return false;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (roles.length === 0) {
      setError('Please select at least one role (Sender or Carrier).');
      return false;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions to register.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await signup(email, password, fullName, phone, roles);
      
      // If Supabase is configured to auto-confirm signups or if session is returned
      if (data?.session) {
        navigate('/dashboard');
      } else {
        // Verification email sent
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="glass-card auth-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div className="logo" style={{ fontSize: '2.5rem', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
            Carrytrip
          </div>
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--success-glow)', 
              color: 'var(--success)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto var(--space-4)' 
            }}
          >
            <Mail size={32} />
          </div>
          <h2 className="display-title" style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }}>Check Your Email</h2>
          <p className="subtitle" style={{ marginBottom: 'var(--space-6)' }}>
            We've sent a verification link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. 
            Please confirm your email to activate your Carrytrip account.
          </p>
          <Link to="/login" className="btn btn-primary">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div className="logo" style={{ fontSize: '2rem', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
            Carrytrip
          </div>
          <h2 className="display-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Account</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Join the peer-to-peer delivery network</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User 
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
                id="fullName"
                type="text"
                className={`form-input ${error && !fullName ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem' }}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone 
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
                id="phone"
                type="tel"
                className={`form-input ${error && !phone ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem' }}
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
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
                className={`form-input ${error && !email ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem' }}
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
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

            {password && (
              <div className="password-strength-container">
                <div className="password-strength-bars">
                  <div className={`strength-bar ${passwordStrength.score >= 1 ? (passwordStrength.score === 1 ? 'weak' : passwordStrength.score === 2 ? 'fair' : passwordStrength.score === 3 ? 'good' : 'strong') : ''}`}></div>
                  <div className={`strength-bar ${passwordStrength.score >= 2 ? (passwordStrength.score === 2 ? 'fair' : passwordStrength.score === 3 ? 'good' : 'strong') : ''}`}></div>
                  <div className={`strength-bar ${passwordStrength.score >= 3 ? (passwordStrength.score === 3 ? 'good' : 'strong') : ''}`}></div>
                  <div className={`strength-bar ${passwordStrength.score >= 4 ? 'strong' : ''}`}></div>
                </div>
                <div className="password-strength-text">
                  Password Strength: <span style={{ 
                    fontWeight: 600, 
                    color: passwordStrength.score === 1 ? 'var(--danger)' : 
                           passwordStrength.score === 2 ? 'var(--warning)' : 
                           passwordStrength.score === 3 ? 'var(--info)' : 
                           passwordStrength.score === 4 ? 'var(--success)' : 'var(--text-secondary)' 
                  }}>{passwordStrength.label}</span>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
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
                id="confirmPassword"
                type="password"
                className={`form-input ${error && !confirmPassword ? 'error' : ''}`}
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label">I want to register as a:</label>
            <div className="role-selector-grid">
              <div 
                className={`role-card ${roles.includes('sender') ? 'selected' : ''}`}
                onClick={() => toggleRole('sender')}
              >
                <div className="role-icon">
                  <Package size={20} />
                </div>
                <h4>Sender</h4>
                <p>I have parcels to send</p>
              </div>

              <div 
                className={`role-card carrier ${roles.includes('carrier') ? 'selected' : ''}`}
                onClick={() => toggleRole('carrier')}
              >
                <div className="role-icon">
                  <Truck size={20} />
                </div>
                <h4>Carrier</h4>
                <p>I travel & deliver parcels</p>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={loading}
              />
              <span>
                I accept the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms & Conditions</a> and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

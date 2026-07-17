import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Very Weak' });
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Calculate password strength dynamically
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Very Weak' });
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div className="logo" style={{ fontSize: '2rem', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
            Carrytrip
          </div>
          <h2 className="display-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create New Password</h2>
          <p className="subtitle" style={{ marginBottom: 0 }}>Choose a secure password for your account</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', margin: 'var(--space-4) 0 var(--space-6)' }}>
            <span style={{ fontWeight: 600 }}>Password updated successfully!</span>
            <span>You will be redirected to the sign-in page in a few seconds...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label className="form-label" htmlFor="password">New Password</label>
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

            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
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

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Resetting Password...
                </>
              ) : (
                <>
                  Reset Password
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

export default ResetPassword;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/Login.css';

const EyeIcon = ({ hidden }) => hidden ? (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.7 10.7 0 0112 4.9c5.1 0 8.5 4.3 9.6 6.1a1.8 1.8 0 010 2c-.4.7-1.2 1.7-2.2 2.7M6.2 6.2c-1.8 1.2-3.1 2.8-3.8 4a1.8 1.8 0 000 2C3.5 14 6.9 18.3 12 18.3c.8 0 1.6-.1 2.3-.3" /></svg>
) : (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.4 12s3.4-6.2 9.6-6.2 9.6 6.2 9.6 6.2-3.4 6.2-9.6 6.2S2.4 12 2.4 12z" /><circle cx="12" cy="12" r="2.5" /></svg>
);

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', credentials);
      localStorage.setItem('celesticare_token', res.data.token);
      localStorage.setItem('celesticare_user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('celesticare-auth-changed'));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login attempt failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-box">
        <div className="login-brand">CELESTICARE</div>
        <h2>Sign In to Your Account</h2>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="login-field-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              className="login-form-control"
              required
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
          </div>

          <div className="login-field-group">
            <label htmlFor="login-password">Password</label>
            <div className="login-password-control"><input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="login-form-control"
              required
              value={credentials.password}
              autoComplete="current-password"
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            /><button type="button" className="login-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}><EyeIcon hidden={showPassword} /></button></div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center', color: '#d0cce6' }}>
          <Link to="/forgot-password" className="login-link">Forgot password?</Link>
        </p>
        <p style={{ marginTop: '12px', fontSize: '14px', textAlign: 'center', color: '#d0cce6' }}>
          Unregistered? <Link to="/register" className="login-link">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

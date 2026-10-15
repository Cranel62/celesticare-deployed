import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/Login.css';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', credentials);
      localStorage.setItem('celesticare_token', res.data.token);
      localStorage.setItem('celesticare_user', JSON.stringify(res.data.user));
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
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              className="login-form-control"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center', color: '#d0cce6' }}>
          Unregistered? <Link to="/register" className="login-link">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
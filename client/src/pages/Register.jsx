import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/Register.css';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', name: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/register', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="register-body">
        <div className="register-box">
          <div className="register-brand">CELESTICARE</div>
          <h2>Verify Your Email</h2>
          <div className="verify-notice">
            <p>We sent a verification link to<br/><strong>{formData.email}</strong> via Brevo.</p>
            <Link to="/login" className="btn-register" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none', boxSizing: 'border-box' }}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-body">
      <div className="register-box">
        <div className="register-brand">CELESTICARE</div>
        <h2>Create Account</h2>
        
        {error && <div className="register-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="register-field-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              placeholder="Choose a username"
              className="register-form-control"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="register-field-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="Enter your full name"
              className="register-form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="register-field-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="Enter your email"
              className="register-form-control"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="register-field-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="At least 8 characters"
              className="register-form-control"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center', color: '#d0cce6' }}>
          Already have an account? <Link to="/login" className="register-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
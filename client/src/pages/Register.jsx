import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/Register.css';

const INITIAL_FORM = { username: '', name: '', email: '', password: '' };
const validationRules = {
  username: (value) => /^[A-Za-z0-9_]{3,}$/.test(value),
  name: (value) => /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '\u2019-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(value.trim()) && value.trim().length >= 2,
  email: (value) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value),
  password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value),
};
const validationMessages = {
  username: 'Use 3+ characters with only letters, numbers, or underscores.',
  name: 'Enter a name with at least 2 letters.',
  email: 'Enter a valid email address, such as you@example.com.',
  password: 'Use 8+ characters with uppercase, lowercase, a number, and a symbol.',
};

function EyeIcon({ hidden }) {
  return hidden ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.7 10.7 0 0112 4.9c5.1 0 8.5 4.3 9.6 6.1a1.8 1.8 0 010 2c-.4.7-1.2 1.7-2.2 2.7M6.2 6.2c-1.8 1.2-3.1 2.8-3.8 4a1.8 1.8 0 000 2C3.5 14 6.9 18.3 12 18.3c.8 0 1.6-.1 2.3-.3" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.4 12s3.4-6.2 9.6-6.2 9.6 6.2 9.6 6.2-3.4 6.2-9.6 6.2S2.4 12 2.4 12z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}

export default function Register() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const errors = useMemo(() => Object.fromEntries(
    Object.entries(validationRules).filter(([field, rule]) => formData[field] && !rule(formData[field])).map(([field]) => [field, validationMessages[field]])
  ), [formData]);
  const passwordScore = useMemo(() => formData.password ? [formData.password.length >= 8, /[a-z]/.test(formData.password), /[A-Z]/.test(formData.password), /\d/.test(formData.password), /[^A-Za-z\d]/.test(formData.password)].filter(Boolean).length : 0, [formData.password]);
  const strength = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'][passwordScore];

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
    setError('');
  };

  const validateForm = () => {
    setTouched(Object.fromEntries(Object.keys(INITIAL_FORM).map((field) => [field, true])));
    return Object.keys(validationRules).every((field) => validationRules[field](formData[field].trim ? formData[field].trim() : formData[field]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
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
        <div className="register-box register-success">
          <div className="register-brand">CELESTICARE</div>
          <div className="success-icon" aria-hidden="true">✓</div>
          <p className="eyebrow">One last step</p>
          <h2>Verify your email</h2>
          <div className="verify-notice">
            <p>We sent a verification link to<br/><strong>{formData.email}</strong>.</p>
            <Link to="/login" className="btn-register verify-button">
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
        <p className="eyebrow">Secure access starts here</p>
        <h2>Create your account</h2>
        <p className="register-subtitle">Join CelestiCare with a protected account.</p>
        
        {error && <div className="register-error" role="alert">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="register-field-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              placeholder="Choose a username"
              className={`register-form-control ${touched.username && errors.username ? 'has-error' : ''}`}
              required
              value={formData.username}
              autoComplete="username"
              aria-invalid={Boolean(touched.username && errors.username)}
              aria-describedby="username-hint"
              onChange={(e) => updateField('username', e.target.value)}
            />
            <p id="username-hint" className={`field-hint ${touched.username && errors.username ? 'field-error' : ''}`}>{touched.username && errors.username ? errors.username : '3+ characters · letters, numbers, and underscores'}</p>
          </div>

          <div className="register-field-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="Enter your full name"
              className={`register-form-control ${touched.name && errors.name ? 'has-error' : ''}`}
              required
              value={formData.name}
              autoComplete="name"
              aria-invalid={Boolean(touched.name && errors.name)}
              aria-describedby="name-hint"
              onChange={(e) => updateField('name', e.target.value)}
            />
            <p id="name-hint" className={`field-hint ${touched.name && errors.name ? 'field-error' : ''}`}>{touched.name && errors.name ? errors.name : 'Use your real name'}</p>
          </div>

          <div className="register-field-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="Enter your email"
              className={`register-form-control ${touched.email && errors.email ? 'has-error' : ''}`}
              required
              value={formData.email}
              autoComplete="email"
              aria-invalid={Boolean(touched.email && errors.email)}
              aria-describedby="email-hint"
              onChange={(e) => updateField('email', e.target.value)}
            />
            <p id="email-hint" className={`field-hint ${touched.email && errors.email ? 'field-error' : ''}`}>{touched.email && errors.email ? errors.email : 'We will send your verification link here'}</p>
          </div>

          <div className="register-field-group">
            <label htmlFor="reg-password">Password</label>
            <div className="password-control"><input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              className={`register-form-control ${touched.password && errors.password ? 'has-error' : ''}`}
              required
              minLength={8}
              value={formData.password}
              autoComplete="new-password"
              aria-invalid={Boolean(touched.password && errors.password)}
              aria-describedby="password-hint password-strength"
              onChange={(e) => updateField('password', e.target.value)}
            /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}><EyeIcon hidden={showPassword} /></button></div>
            {formData.password && <div id="password-strength" className={`password-strength strength-${strength.toLowerCase()}`} aria-live="polite"><div className="strength-header"><span>Password strength</span><strong>{strength}</strong></div><div className="strength-bar" aria-hidden="true">{[1, 2, 3, 4].map((segment) => <span key={segment} className={passwordScore >= segment + 1 ? 'active' : ''} />)}</div></div>}
            <p id="password-hint" className={`field-hint ${touched.password && errors.password ? 'field-error' : ''}`}>{touched.password && errors.password ? errors.password : '8+ characters with upper, lower, number, and symbol'}</p>
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? <><span className="loading-spinner" aria-hidden="true" /> Creating account...</> : 'Create account'}
          </button>
        </form>
        
        <p className="register-footer">
          Already have an account? <Link to="/login" className="register-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

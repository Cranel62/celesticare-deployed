import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Admin.css';
import '../../styles/Login.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      const isAdminUser = res.data.user?.role === 'admin' || res.data.user?.is_admin === true;

      if (isAdminUser) {
        localStorage.setItem('celesticare_token', res.data.token);
        localStorage.setItem('celesticare_user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('celesticare-auth-changed'));
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="admin-body admin-login-page login-body">
      <div className="admin-bg-accent one"></div>
      <div className="admin-bg-accent two"></div>
      <div className="admin-login-box login-box">
        <div className="login-brand">
          CELESTICARE <span className="admin-login-badge">ADMIN</span>
        </div>
        <h2>Admin Access</h2>
        {error && <div className="login-error" role="alert">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="login-field-group">
            <label htmlFor="admin-email">Email Address</label>
            <input id="admin-email" className="login-form-control" type="email" placeholder="Enter your admin email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="login-field-group">
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" className="login-form-control" type="password" placeholder="Enter your password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-login">Access Admin Panel</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}><Link to="/login" style={{ color: '#cfcfcf' }}>← Back to User Login</Link></p>
      </div>
    </div>
  );
}

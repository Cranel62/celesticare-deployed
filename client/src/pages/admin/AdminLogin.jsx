import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Admin.css';

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
    <div className="admin-body">
      <div className="admin-bg-accent one"></div>
      <div className="admin-bg-accent two"></div>
      <div className="admin-login-box">
        <div style={{ fontWeight: 700, fontSize: '24px', textAlign: 'center', marginBottom: '5px' }}>
          CELESTICARE <span style={{ background: '#6b5b95', color: 'white', padding: '4px 12px', borderRadius: '15px', fontSize: '0.75rem' }}>ADMIN</span>
        </div>
        <h2 style={{ fontSize: '20px', textAlign: 'center', marginBottom: '25px' }}>Admin Access</h2>
        {error && <div style={{ background: '#dc3545', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Admin Email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', background: '#4b4b4b', border: 'none', color: '#fff', borderRadius: '30px', padding: '12px 20px', marginBottom: '15px' }} />
          <input type="password" placeholder="Password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', background: '#4b4b4b', border: 'none', color: '#fff', borderRadius: '30px', padding: '12px 20px', marginBottom: '20px' }} />
          <button type="submit" style={{ width: '100%', background: '#6b5b95', color: '#fff', border: 'none', borderRadius: '30px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Access Admin Panel</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}><Link to="/login" style={{ color: '#cfcfcf' }}>← Back to User Login</Link></p>
      </div>
    </div>
  );
}

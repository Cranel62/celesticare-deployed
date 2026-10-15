import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was your first car?",
  "What elementary school did you attend?",
  "What is your favorite book?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
  "What is your favorite food?",
  "What is the name of your best friend?"
];

export default function SecuritySettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Security Questions State
  const [qData, setQData] = useState({
    question1: '', answer1: '',
    question2: '', answer2: '',
    question3: '', answer3: ''
  });

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    API.get('/auth/me').then(({ data }) => {
      setUser(data.user);
      localStorage.setItem('celesticare_user', JSON.stringify(data.user));
    }).catch(err => setError(err.response?.data?.message || 'Unable to load your account security status.'));
  }, []);

  const handleQuestionChange = (e) => {
    setQData({ ...qData, [e.target.name]: e.target.value });
  };

  const handleSaveQuestions = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await API.post('/auth/security', qData);

      if (res.data.success) {
        const updatedUser = { ...user, security_setup_complete: true };
        setUser(updatedUser);
        localStorage.setItem('celesticare_user', JSON.stringify(updatedUser));
        setMessage('Security questions saved successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Database error occurred while saving.');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Password is required to delete your account.');
      return;
    }

    try {
      const res = await API.post('/auth/delete-account', { password: deletePassword });

      if (res.data.success) {
        localStorage.clear(); // Clears session mirroring logout.php & check_session.php
        navigate('/');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Password is incorrect or an error occurred.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d3bff5 0%, #3c3b7d 100%)',
      fontFamily: "'Poppins', sans-serif",
      padding: '100px 20px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        background: '#2e2e2e',
        borderRadius: '20px',
        padding: '40px',
        color: 'white',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '700px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          <i className="fas fa-shield-alt" style={{ marginRight: '10px' }}></i>
          Secure Your Account
        </h2>
        
        <div style={{ background: 'rgba(107, 91, 149, 0.2)', borderLeft: '4px solid #6b5b95', padding: '15px', borderRadius: '10px', marginBottom: '30px' }}>
          <i className="fas fa-info-circle" style={{ color: '#6b5b95', marginRight: '10px' }}></i>
          Set up security questions to protect your account. You'll need these if you forget your password.
        </div>

        {message && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSaveQuestions}>
          {[1, 2, 3].map((num) => (
            <div key={num} style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>Security Question {num}</label>
              <select 
                name={`question${num}`} 
                value={qData[`question${num}`]} 
                onChange={handleQuestionChange} 
                required
                style={{ width: '100%', backgroundColor: '#4b4b4b', border: 'none', color: 'white', borderRadius: '30px', padding: '12px 20px', marginBottom: '10px', outline: 'none' }}
              >
                <option value="">Select a question</option>
                {SECURITY_QUESTIONS.map((q, i) => <option key={i} value={q}>{q}</option>)}
              </select>
              <input 
                type="text" 
                name={`answer${num}`} 
                value={qData[`answer${num}`]} 
                onChange={handleQuestionChange} 
                placeholder="Your answer" 
                required
                style={{ width: '100%', backgroundColor: '#4b4b4b', border: 'none', color: 'white', borderRadius: '30px', padding: '12px 20px', outline: 'none' }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <Link to="/dashboard" style={{ flex: 1, textAlign: 'center', backgroundColor: 'transparent', color: '#cfcfcf', border: '1px solid #cfcfcf', borderRadius: '30px', padding: '12px 20px', textDecoration: 'none', transition: '0.3s' }}>
              Remind Me Later
            </Link>
            <button type="submit" style={{ flex: 1, backgroundColor: '#6b5b95', color: 'white', border: 'none', borderRadius: '30px', padding: '12px 20px', cursor: 'pointer', fontWeight: 'bold' }}>
              Save Questions
            </button>
          </div>
        </form>

        {/* Danger Zone: Delete Account */}
        <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #4b4b4b' }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>Danger Zone</h3>
          <p style={{ color: '#cfcfcf', fontSize: '0.9rem', marginBottom: '20px' }}>
            Once you delete your account, all your data (outfits, feedback, quizzes, and profile) will be permanently removed. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              style={{ backgroundColor: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '30px', padding: '10px 20px', cursor: 'pointer', width: '100%' }}
            >
              Delete Account
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} style={{ background: 'rgba(255, 107, 107, 0.1)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
              {deleteError && <div style={{ color: '#ff6b6b', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{deleteError}</div>}
              <label style={{ display: 'block', marginBottom: '10px', color: '#ff6b6b' }}>Enter password to confirm deletion:</label>
              <input 
                type="password" 
                value={deletePassword} 
                onChange={(e) => setDeletePassword(e.target.value)} 
                required
                style={{ width: '100%', backgroundColor: '#4b4b4b', border: 'none', color: 'white', borderRadius: '30px', padding: '12px 20px', marginBottom: '15px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} style={{ flex: 1, backgroundColor: '#4b4b4b', color: 'white', border: 'none', borderRadius: '30px', padding: '10px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '30px', padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm Delete</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
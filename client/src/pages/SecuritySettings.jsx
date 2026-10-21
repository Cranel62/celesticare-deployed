import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/SecuritySettings.css';

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
  const [deletePending, setDeletePending] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(0);

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

  const finalizeDeleteAccount = useCallback(async () => {
    try {
      const res = await API.post('/auth/delete-account', { password: deletePassword });

      if (res.data.success) {
        localStorage.removeItem('celesticare_token');
        localStorage.removeItem('celesticare_user');
        window.dispatchEvent(new Event('celesticare-auth-changed'));
        navigate('/', { replace: true });
      }
    } catch (err) {
      setDeletePending(false);
      setDeleteCountdown(0);
      setDeleteError(err.response?.data?.message || 'Password is incorrect or an error occurred.');
    }
  }, [deletePassword, navigate]);

  useEffect(() => {
    if (!deletePending) return undefined;

    if (deleteCountdown === 0) {
      const timer = window.setTimeout(finalizeDeleteAccount, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setDeleteCountdown((countdown) => countdown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [deletePending, deleteCountdown, finalizeDeleteAccount]);

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Password is required to delete your account.');
      return;
    }

    setDeletePending(true);
    setDeleteCountdown(10);
  };

  const handleCancelDeletion = () => {
    setDeletePending(false);
    setDeleteCountdown(0);
    setDeletePassword('');
    setDeleteError('Account deletion cancelled.');
  };

  return (
    <main className="security-settings-body">
      <section className="security-settings-card">
        <h1 className="security-settings-title">
          <i className="fas fa-shield-alt" aria-hidden="true"></i>
          Secure Your Account
        </h1>
        
        <div className="security-settings-notice">
          <i className="fas fa-info-circle" aria-hidden="true"></i>
          Set up security questions to protect your account. You'll need these if you forget your password.
        </div>
        <p className="security-settings-description">
          Passwords and security-question answers are stored as one-way hashes, not readable text. Choose recovery answers that are difficult to guess and do not reuse your password.
        </p>

        {message && <div className="security-settings-success" role="status">{message}</div>}
        {error && <div className="security-settings-error" role="alert">{error}</div>}

        <form onSubmit={handleSaveQuestions} className="security-settings-form">
          {[1, 2, 3].map((num) => (
            <div key={num} className="security-settings-field">
              <label className="security-settings-label" htmlFor={`security-question-${num}`}>Security Question {num}</label>
              <select 
                id={`security-question-${num}`}
                name={`question${num}`} 
                value={qData[`question${num}`]} 
                onChange={handleQuestionChange} 
                required
                className="security-settings-input"
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
                className="security-settings-input"
                autoComplete="off"
              />
            </div>
          ))}

          <div className="security-settings-actions">
            <Link to="/dashboard" className="security-settings-remind">
              Remind Me Later
            </Link>
            <button type="submit" className="security-settings-submit">
              Save Questions
            </button>
          </div>
        </form>

        {/* Danger Zone: Delete Account */}
        <div className="security-danger-zone">
          <h2 className="security-danger-title">Danger Zone</h2>
          <p className="security-danger-description">
            Once you delete your account, all your data (outfits, feedback, quizzes, and profile) will be permanently removed. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="security-delete-trigger"
            >
              Delete Account
            </button>
          ) : deletePending ? (
            <div className="security-delete-form" role="alert" aria-live="assertive">
              <p className="security-delete-countdown">
                Your account will be permanently deleted in <strong>{deleteCountdown} seconds</strong>.
              </p>
              <button type="button" onClick={handleCancelDeletion} className="security-delete-cancel">
                Cancel Deletion
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} className="security-delete-form">
              {deleteError && <div className="security-delete-error" role="alert">{deleteError}</div>}
              <label className="security-delete-label" htmlFor="delete-account-password">Enter password to confirm deletion:</label>
              <input 
                id="delete-account-password"
                type="password" 
                value={deletePassword} 
                onChange={(e) => setDeletePassword(e.target.value)} 
                required
                className="security-settings-input"
                autoComplete="current-password"
              />
              <div className="security-delete-actions">
                <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} className="security-delete-cancel">Cancel</button>
                <button type="submit" className="security-delete-confirm">Confirm Delete</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

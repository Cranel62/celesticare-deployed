import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleLookup = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/forgot-password/questions', { email });
      setQuestions(data.questions);
      setAnswers(data.questions.map(() => ''));
      setIsVerified(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to start password recovery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Your new password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password/reset', {
        email,
        answers: questions.map((question, index) => ({
          question,
          answer: answers[index],
        })),
        password,
      });
      setMessage(data.message || 'Password reset successfully. You can now sign in.');
      setQuestions([]);
      setAnswers([]);
      setPassword('');
      setConfirmPassword('');
      setIsVerified(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset your password. Check your answers and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-body">
      <section className="forgot-password-card">
        <h1><i className="fas fa-shield-alt" aria-hidden="true"></i> Reset Your Password</h1>
        <div className="forgot-password-notice">
          Verify your account with the three security questions you saved in Security Settings.
          Your answers are checked securely and are never shown back to you.
        </div>

        {message && <div className="forgot-password-success" role="status">{message}</div>}
        {error && <div className="forgot-password-error" role="alert">{error}</div>}

        {!isVerified ? (
          <form onSubmit={handleLookup}>
            <label className="forgot-password-label" htmlFor="recovery-email">Account email</label>
            <input
              id="recovery-email"
              className="forgot-password-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter the email on your account"
              required
            />
            <button className="forgot-password-submit" type="submit" disabled={loading}>
              {loading ? 'Loading security questions...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            {questions.map((question, index) => (
              <div className="forgot-password-field" key={question}>
                <label className="forgot-password-label" htmlFor={`recovery-answer-${index}`}>
                  {question}
                </label>
                <input
                  id={`recovery-answer-${index}`}
                  className="forgot-password-input"
                  type="text"
                  autoComplete="off"
                  value={answers[index]}
                  onChange={(event) => setAnswers((currentAnswers) => currentAnswers.map(
                    (answer, answerIndex) => answerIndex === index ? event.target.value : answer
                  ))}
                  required
                />
              </div>
            ))}
            <div className="forgot-password-field">
              <label className="forgot-password-label" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                className="forgot-password-input"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="forgot-password-field">
              <label className="forgot-password-label" htmlFor="confirm-new-password">Confirm new password</label>
              <input
                id="confirm-new-password"
                className="forgot-password-input"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            <button className="forgot-password-submit" type="submit" disabled={loading}>
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
            <button
              className="forgot-password-back"
              type="button"
              onClick={() => {
                setIsVerified(false);
                setQuestions([]);
                setAnswers([]);
                setError('');
              }}
            >
              Use a different email
            </button>
          </form>
        )}

        <Link to="/login" className="forgot-password-login">Back to sign in</Link>
      </section>
    </main>
  );
}

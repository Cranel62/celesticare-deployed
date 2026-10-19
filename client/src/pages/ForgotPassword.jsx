import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [useAlternativeEmail, setUseAlternativeEmail] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const handleLookup = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await API.post('/auth/forgot-password/request-code', {
        accountEmail: email,
        deliveryEmail: useAlternativeEmail ? deliveryEmail : email,
      });
      setQuestions([]);
      setAnswers([]);
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

    if (!passwordRule.test(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = questions.length ? '/auth/forgot-password/reset' : '/auth/forgot-password/reset-code';
      const payload = questions.length ? {
        email,
        answers: questions.map((question, index) => ({ question, answer: answers[index] })),
        password,
      } : { email, code: resetCode, password };
      const { data } = await API.post(endpoint, payload);
      setMessage(data.message || 'Password reset successfully. You can now sign in.');
      setQuestions([]);
      setAnswers([]);
      setPassword('');
      setConfirmPassword('');
      setResetCode('');
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
          Verify your account with a Brevo email verification code. The code expires after 15 minutes.
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
            <button
              className="forgot-password-back"
              type="button"
              onClick={() => setUseAlternativeEmail((value) => !value)}
            >
              {useAlternativeEmail ? 'Use account email instead' : 'Try another way / use a different email'}
            </button>
            {useAlternativeEmail && (
              <>
                <label className="forgot-password-label" htmlFor="delivery-email">Email to receive the verification code</label>
                <input id="delivery-email" className="forgot-password-input" type="email" value={deliveryEmail} onChange={(event) => setDeliveryEmail(event.target.value)} required />
              </>
            )}
            <button className="forgot-password-submit" type="submit" disabled={loading}>
              {loading ? 'Sending verification code...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            {!questions.length && (
              <div className="forgot-password-field">
                <label className="forgot-password-label" htmlFor="reset-code">Verification code</label>
                <input id="reset-code" className="forgot-password-input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={resetCode} onChange={(event) => setResetCode(event.target.value.replace(/\D/g, ''))} required />
              </div>
            )}
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
              {confirmPassword && <small>{password === confirmPassword ? 'Passwords match.' : 'Passwords do not match.'}</small>}
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

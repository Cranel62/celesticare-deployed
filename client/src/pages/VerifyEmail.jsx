import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import '../styles/VerifyEmail.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  
  const verificationTriggered = useRef(false);

  useEffect(() => {
    if (verificationTriggered.current) return;
    verificationTriggered.current = true;

    const triggerVerification = async () => {
      try {
        const res = await API.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Your account has been successfully verified!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    triggerVerification();
  }, [token]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  return (
    <div className="verify-body">
      <div className="verify-box">
        <div className="verify-brand">CELESTICARE</div>
        
        {status === 'verifying' && (
          <>
            <div className="loader-spinner"></div>
            <h3 style={{ fontWeight: '500' }}>Verifying Account...</h3>
            <p>Confirming your token with CelestiCare Security.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-icon-success">✓</div>
            <h2 style={{ color: '#a7efcb' }}>Verified Successfully!</h2>
            <p>{message}</p>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>
              Redirecting to login in <strong>{countdown}</strong> seconds...
            </p>
            <Link to="/login" className="btn-verify">Go to Login Now</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-icon-error">✕</div>
            <h2 style={{ color: '#ff8a8a' }}>Verification Failed</h2>
            <p>{message}</p>
            <Link to="/register" className="btn-verify">Register Again</Link>
          </>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/StyleWelcome.css';

export default function StyleWelcome() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  const handleBegin = () => {
    setFading(true);
    setTimeout(() => {
      navigate('/body-type');
    }, 600);
  };

  return (
    <div className={`stylewelcome-body ${fading ? 'fade-blur-out' : ''}`}>
      <div className="stylewelcome-container">
        <div className="stylewelcome-bg-accent stylewelcome-one"></div>
        <div className="stylewelcome-bg-accent stylewelcome-two"></div>

        <div className="stylewelcome-box">
          <div className="stylewelcome-brand-title">CELESTICARE</div>
          <h2>Discover Your Stylistic Vibe</h2>
          <p>
            Every person carries a signature visual rhythm — a harmony between personality, energy, and style.
            Begin your journey to uncover the style that defines and best suits you, shaping how you see and express yourself.
          </p>
          <button onClick={handleBegin} className="stylewelcome-btn-start">
            Begin!
          </button>
        </div>
      </div>
    </div>
  );
}
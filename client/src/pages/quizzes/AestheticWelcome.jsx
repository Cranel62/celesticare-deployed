import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AestheticWelcome.css';

export default function AestheticWelcome() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  const handleBegin = () => {
    setFading(true);
    setTimeout(() => {
      navigate('/aesthetic-quiz');
    }, 600);
  };

  return (
    <div className={`aestheticwelcome-body ${fading ? 'fade-blur-out' : ''}`}>
      <div className="aestheticwelcome-container">
        <div className="aestheticwelcome-bg-accent aestheticwelcome-one"></div>
        <div className="aestheticwelcome-bg-accent aestheticwelcome-two"></div>

        <div className="aestheticwelcome-box">

        <div className="aestheticwelcome-brand-title">CELESTICARE</div>
        <h2>Discover Your Aesthetic Essence</h2>
        <p>
          Every individual has a unique style energy — a blend of personality, mood, and self-expression.
          Knowing your aesthetic helps you express your identity confidently and create a cohesive wardrobe that truly reflects who you are.
        </p>
        <button onClick={handleBegin} className="aestheticwelcome-btn-start">
          Begin!
        </button>
        </div>
      </div>
    </div>
  );
}

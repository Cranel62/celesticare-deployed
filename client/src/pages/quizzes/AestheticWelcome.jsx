import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      background: 'linear-gradient(135deg, #d3cce3 0%, #705794 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px',
      opacity: fading ? 0 : 1,
      filter: fading ? 'blur(25px)' : 'none',
      transition: 'opacity 0.6s ease, filter 0.6s ease'
    }}>
      <div style={{
        backgroundColor: '#2e2e2e', color: '#ffffff', padding: '80px 60px',
        borderRadius: '35px', maxWidth: '850px', width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)', textAlign: 'center'
      }}>
        <div style={{ fontWeight: 700, fontSize: '36px', letterSpacing: '2px', marginBottom: '30px' }}>CELESTICARE</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#e4e4e4', marginBottom: '25px' }}>Discover Your Aesthetic Essence</h2>
        <p style={{ fontSize: '1.15rem', color: '#dcdcdc', marginBottom: '35px', lineHeight: 1.8, maxWidth: '700px', margin: '0 auto 35px auto' }}>
          Every individual has a unique style energy — a blend of personality, mood, and self-expression.
          Knowing your aesthetic helps you express your identity confidently and create a cohesive wardrobe that truly reflects who you are.
        </p>
        <button 
          onClick={handleBegin}
          style={{ background: '#6b5b95', color: '#fff', border: 'none', borderRadius: '35px', padding: '15px 45px', fontWeight: 500, fontSize: '1.1rem', cursor: 'pointer' }}
        >
          Begin
        </button>
      </div>
    </div>
  );
}
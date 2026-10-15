import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ZodiacResult.css';

const traits = {
  "Aries": "The Bold", "Taurus": "The Grounded", "Gemini": "The Curious",
  "Cancer": "The Nurturer", "Leo": "The Radiant", "Virgo": "The Perfectionist",
  "Libra": "The Harmonizer", "Scorpio": "The Intense", "Sagittarius": "The Adventurer",
  "Capricorn": "The Ambitious", "Aquarius": "The Visionary", "Pisces": "The Whimsical"
};

export default function ZodiacResult() {
  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem('celesticare_onboarding') || '{}');

  useEffect(() => {
    if (!data.zodiac_sign) navigate('/get-to-know');
  }, [data, navigate]);

  return (
    <div className="zodiacresult-body">
      <div className="zodiacresult-box">
        <div className="zodiacresult-brand-title">CELESTICARE</div>
        <h2>Your Sun Sign Is</h2>
        <h1>{data.zodiac_sign}</h1>
        <p>{traits[data.zodiac_sign] || "The Unique"}</p>
        <Link to="/undertone-test" className="zodiacresult-btn">Continue</Link>
      </div>
    </div>
  );
}
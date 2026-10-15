import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GetToKnow.css';

export default function GetToKnow() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', birthdate: '', gender: '' });

  useEffect(() => {
    // Check if user is already logged in
    const userToken = localStorage.getItem('celesticare_token');
    const userData = localStorage.getItem('celesticare_user');

    if (userToken || userData) {
      navigate('/zodiac-result');
      return;
    }

    // Minimal update: Automatically clear/reset onboarding input session storage/state 
    // when a guest user visits or refreshes the get-to-know page so inputs don't persist unexpectedly.
    localStorage.removeItem('celesticare_onboarding');
    setFormData({ name: '', birthdate: '', gender: '' });
  }, [navigate]);

  const calculateZodiac = (dateStr) => {
    const d = new Date(dateStr);
    const m = d.getMonth() + 1, day = d.getDate();
    if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Aries';
    if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Taurus';
    if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'Gemini';
    if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'Cancer';
    if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Leo';
    if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Virgo';
    if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'Libra';
    if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'Scorpio';
    if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'Sagittarius';
    if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'Capricorn';
    if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sign = calculateZodiac(formData.birthdate);
    localStorage.setItem('celesticare_onboarding', JSON.stringify({ ...formData, zodiac_sign: sign }));
    navigate('/zodiac-result');
  };

  return (
    <div className="gettoknow-body">
      <div className="gettoknow-setup-box">
        <div className="gettoknow-brand-title">CELESTICARE</div>
        <h2>Time to get to know you</h2>
        <p>Provide the following details below</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="form-control gettoknow-input" 
            placeholder="Name" 
            value={formData.name}
            required 
            onChange={e => setFormData({...formData, name: e.target.value})} 
          />
          <input 
            type="date" 
            className="form-control gettoknow-input" 
            value={formData.birthdate}
            required 
            onChange={e => setFormData({...formData, birthdate: e.target.value})} 
          />
          <select 
            className="form-control gettoknow-input" 
            required 
            value={formData.gender}
            onChange={e => setFormData({...formData, gender: e.target.value})}
          >
            <option value="" disabled>Masculine, Feminine</option>
            <option value="Masculine">Masculine</option>
            <option value="Feminine">Feminine</option>
          </select>
          <button type="submit" className="btn-continue gettoknow-btn">Continue</button>
        </form>
      </div>
    </div>
  );
}
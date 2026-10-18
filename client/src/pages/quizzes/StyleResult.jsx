import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/StyleResult.css';

const STYLE_INFO = {
  minimalist: { name: 'Minimalist Elegance', desc: 'Clean, simple, and timeless pieces.', colors: 'White, black, beige, grey', occasions: 'Everyday, casual' },
  businesswear: { name: 'Professional Businesswear', desc: 'Polished, professional, and structured.', colors: 'Navy, black, grey, white', occasions: 'Work, meetings' },
  elegant: { name: 'Classic Elegance', desc: 'Sophisticated, classy, and luxurious.', colors: 'Pastels, jewel tones', occasions: 'Formal events' },
  creative: { name: 'Creative Expression', desc: 'Bold, artistic, and expressive.', colors: 'Bright, contrasting', occasions: 'Art events, casual' },
  soft: { name: 'Soft Elegance', desc: 'Gentle, pastel, and cozy pieces.', colors: 'Pastels, cream', occasions: 'Coffee dates' },
  rough: { name: 'Rough Edge', desc: 'Edgy, casual, and street-inspired.', colors: 'Black, grey', occasions: 'Street, concerts' },
  streetwear: { name: 'Urban Streetwear', desc: 'Urban, trendy, and casual.', colors: 'Black, white, bold', occasions: 'City walks' }
};

export default function StyleResult() {
  const navigate = useNavigate();
  const [outfitData, setOutfitData] = useState([]);
  const [topStyle, setTopStyle] = useState('minimalist');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchOutfit = async () => {
      try {
        const res = await API.get('/outfits/latest');
        if (res.data.success && res.data.outfit) {
          // Limit to 9 items for the 3x3 grid display
          setOutfitData(res.data.outfit.outfit_data.slice(0, 9));
          setTopStyle(res.data.outfit.clothing_style || 'minimalist');
        } else {
          navigate('/style-welcome');
        }
      } catch (err) {
        console.error(err);
        navigate('/style-welcome');
      }
    };
    fetchOutfit();
  }, [navigate]);

  const handleDeleteOutfit = async () => {
    if (!window.confirm("Are you sure you want to delete your existing outfit? This will reset your style result.")) return;
    setIsDeleting(true);
    try {
      await API.delete('/outfits/latest');
      
      const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
      delete user.style_result;
      localStorage.setItem('celesticare_user', JSON.stringify(user));

      const userGender = user.gender ? user.gender.toLowerCase() : '';
      if (userGender === 'masculine' || userGender === 'feminine') {
        navigate('/body-type');
      } else {
        navigate('/style-welcome');
      }
    } catch (err) {
      console.error('Failed to delete outfit:', err);
      alert('Unable to delete your outfit. Please try again.');
      setIsDeleting(false);
    }
  };

  const info = STYLE_INFO[topStyle] || STYLE_INFO['minimalist'];

  return (
    <div style={{ padding: '100px 0 60px' }}>
    <div className="sr-container">
      {/* Redesigned Grid Display Panel */}
      <div className="sr-display">
        <div className="sr-grid-panel">
          <h3 className="sr-grid-heading">Your Outfit Grid</h3>
          {outfitData.length === 0 ? (
            <p className="sr-no-items">No items found in this outfit.</p>
          ) : (
            <div className="sr-cards-grid">
              {outfitData.map((item, idx) => (
                <div key={idx} className="sr-grid-card">
                  <div className="sr-thumbnail-wrapper">
                    <img 
                      src={item.src} 
                      alt={`Outfit item ${idx + 1}`}
                      className="sr-grid-thumbnail"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sr-info">
        <div className="sr-badge">Style Analysis</div>
        <h1 className="sr-title">{info.name}</h1>
        <p className="sr-desc">{info.desc}</p>
        
        <div className="sr-card">
          <strong>Color Palette</strong>
          <p>{info.colors}</p>
        </div>

        <div className="sr-card">
          <strong>Perfect For</strong>
          <p>{info.occasions}</p>
        </div>

        <div className="sr-buttons">
          <Link to="/dashboard" className="sr-btn" style={{ background: '#8B5FBF' }}>Dashboard</Link>
          <Link to="/moodboard" className="sr-btn" style={{ background: '#2475ee' }}>Moodboard</Link>
          <button onClick={handleDeleteOutfit} disabled={isDeleting} className="sr-btn" style={{ background: '#EF4444', border: 'none', cursor: 'pointer' }}>
            {isDeleting ? 'Deleting...' : 'Delete Outfit'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
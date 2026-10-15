import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Tarot.css';
import '../../styles/TarotPickers.css';
import { tarotCardSrc, TAROT_BACK } from '../../utils/tarotImages';

const POSITIONS = ['past', 'heart', 'head', 'path'];
const POS_TITLES = {
  past: { title: 'The Past', q: 'What brought you here?', icon: '📜' },
  heart: { title: 'The Heart', q: 'What do you truly feel?', icon: '❤️' },
  head: { title: 'The Head', q: 'What do you rationally think?', icon: '🧠' },
  path: { title: 'The Path', q: 'Where do you go from here?', icon: '🛤️' }
};

export default function FourCardPicker() {
  const navigate = useNavigate();
  const [selectedCards, setSelectedCards] = useState({ past: null, heart: null, head: null, path: null });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFanOpen, setIsFanOpen] = useState(false);
  const [fanCards, setFanCards] = useState([]);
  const [message, setMessage] = useState('Click on The Past to begin');

  useEffect(() => {
    const starsContainer = document.getElementById('stars');
    if (starsContainer && starsContainer.children.length === 0) {
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        starsContainer.appendChild(star);
      }
    }
  }, []);

  const activatePosition = async (pos) => {
    if (pos !== POSITIONS[currentIndex]) {
      setMessage(`✨ First complete ${POS_TITLES[POSITIONS[currentIndex]].title}`);
      return;
    }
    if (selectedCards[pos]) return;

    try {
      const res = await API.get('/tarot/fan?count=10');
      setFanCards(res.data.cards || Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Card ${i+1}` })));
      setIsFanOpen(true);
    } catch (err) {
      console.error(err);
      setFanCards(Array.from({ length: 10 }, (_, i) => ({ id: Math.floor(Math.random() * 78) + 1, name: `Card ${i+1}` })));
      setIsFanOpen(true);
    }
  };

  const handleCardSelect = (card) => {
    const pos = POSITIONS[currentIndex];
    setSelectedCards(prev => ({ ...prev, [pos]: card.id }));
    setIsFanOpen(false);

    if (currentIndex + 1 >= POSITIONS.length) {
      setMessage('Your journey is complete... Weaving your destiny.');
      sessionStorage.setItem('heartHeadPathSpread', JSON.stringify({
        ...selectedCards,
        [pos]: card.id
      }));
      setTimeout(() => navigate('/tarot/four-result'), 1500);
    } else {
      const nextPos = POSITIONS[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setMessage(`✨ Now choose ${POS_TITLES[nextPos].title}`);
    }
  };

  const getFanPosition = (index, total) => {
    const angle = (index - (total - 1) / 2) * 12;
    const radians = (angle * Math.PI) / 180;
    return {
      x: Math.sin(radians) * 280,
      y: -Math.abs(Math.sin(radians) * 35) - 10,
      rotate: angle * -0.4
    };
  };

  return (
    <div className="tarot-body">
      <Link to="/tarot" className="return-button" style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 1000 }}>← Back</Link>
      <div className="stars" id="stars"></div>

      <div className="tarot-container" style={{ paddingTop: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Cinzel', fontSize: '2.5rem', color: '#f0d0f0', textShadow: '0 0 30px rgba(180,130,200,0.6)' }}>𓆩♡𓆪 Heart, Head & Path 𓆩♡𓆪</h1>
          <p style={{ color: '#d0b0d0', fontStyle: 'italic' }}>Four cards will reveal your inner journey</p>
        </div>

        <div className="fcp-spread-row">
          {POSITIONS.map((pos, idx) => (
            <div 
              key={pos} 
              className={`fcp-position-card ${selectedCards[pos] ? 'filled' : ''} ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => activatePosition(pos)}
            >
              {selectedCards[pos] ? (
                <img src={tarotCardSrc(selectedCards[pos])} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#1a0f1a' }} alt={pos} onError={e=>e.target.src=TAROT_BACK} />
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div className="fcp-position-icon">{POS_TITLES[pos].icon}</div>
                  <div className="fcp-position-title">{POS_TITLES[pos].title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#c0a0c0', fontStyle: 'italic' }}>{POS_TITLES[pos].q}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '1.2rem', color: '#d0b0d0' }}>
          {message}
        </div>
      </div>

      {isFanOpen && (
        <div className="fcp-fan-overlay active">
          <button className="return-button" style={{ position: 'absolute', top: '2rem', right: '2rem' }} onClick={() => setIsFanOpen(false)}>✕ Close</button>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Cinzel', color: '#c0a0c0' }}>Choose {POS_TITLES[POSITIONS[currentIndex]].title}</h2>
            <p style={{ color: '#d0b0d0' }}>Select the card that speaks to you</p>
          </div>
          
          <div className="fcp-fan-cards-container">
            {fanCards.map((card, i) => {
              const pos = getFanPosition(i, fanCards.length);
              return (
                <div 
                  key={card.id || i} 
                  className="fcp-fan-card" 
                  style={{ transform: `translateX(${pos.x}px) translateY(${pos.y}px) rotate(${pos.rotate}deg)`, zIndex: i, animationDelay: `${i * 0.03}s` }}
                  onClick={() => handleCardSelect(card)}
                >
                  <img src={TAROT_BACK} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Card Back" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
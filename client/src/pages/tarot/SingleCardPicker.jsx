import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/Tarot.css';
import '../../styles/TarotPickers.css';
import { TAROT_BACK } from '../../utils/tarotImages';
import { TAROT_CARDS } from '../../data/tarotCards';
import API from '../../services/api';

const CARD_COUNT = TAROT_CARDS.length;

export default function SingleCardPicker() {
  const navigate = useNavigate();
  const [shuffling, setShuffling] = useState(false);
  const [savedCardId, setSavedCardId] = useState(null);
  const deckRef = useRef(null);
  const cardsRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    API.get('/tarot/single-card').then(({ data }) => {
      if (data.cardId !== null && data.cardId !== undefined) setSavedCardId(data.cardId);
    }).catch(() => {});
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
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const startShuffle = () => {
    if (shuffling) return;
    setShuffling(true);
    setTimeout(() => {
      createDeckAndAnimate();
    }, 500);
  };

  const createDeckAndAnimate = () => {
    const container = deckRef.current;
    if (!container) return;
    
    container.innerHTML = '';
    cardsRef.current = [];
    const centerX = (container.clientWidth / 2) - 100;
    const centerY = 175 - 145;

    for (let i = 0; i < 12; i++) {
      const card = document.createElement('div');
      card.className = 'scp-deck-card';
      card.innerHTML = `<img src="${TAROT_BACK}" style="width:100%; height:100%; object-fit:cover; border-radius:13px;" alt="Card Back" />`;
      card.style.transform = `translate(${centerX}px, ${centerY - 5 - i * 0.5}px) rotate(0deg)`;
      card.style.zIndex = i;
      container.appendChild(card);
      cardsRef.current.push(card);
    }

    let step = 0;
    let startTime = performance.now();

    const animateShuffle = (now) => {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(elapsed / 1.0, 1);

      if (step <= 3) {
        cardsRef.current.forEach((card, i) => {
          let x, y, rotate, scale = 1;
          if (step === 0) {
            x = centerX * (1 - t) + (centerX + (i * 4 - 24)) * t;
            y = (centerY - 5 - i * 0.5) * (1 - t) + (centerY + (i * 2 - 10)) * t;
            rotate = 0 * (1 - t) + (i * 2 - 12) * t;
          } else if (step === 1) {
            x = (centerX + (i * 4 - 24)) * (1 - t) + centerX * t;
            y = (centerY + (i * 2 - 10)) * (1 - t) + (centerY - 10) * t;
            rotate = (i * 2 - 12) * (1 - t) + 0 * t;
          } else if (step === 2) {
            const side = i % 2 === 0 ? -1 : 1;
            x = centerX * (1 - t) + (centerX + (side * 70)) * t;
            y = (centerY - 10) * (1 - t) + (centerY - 20 + Math.sin(i) * 10) * t;
            rotate = 0 * (1 - t) + (side * 10) * t;
          } else if (step === 3) {
            const side = i % 2 === 0 ? -1 : 1;
            x = (centerX + (side * 50)) + Math.sin(t * Math.PI * 8 + i) * 40;
            y = centerY - 20 + Math.cos(t * Math.PI * 6 + i) * 15;
            rotate = side * 8 + Math.sin(t * Math.PI * 10 + i) * 20;
            scale = 0.9 + 0.2 * Math.sin(t * Math.PI * 12 + i);
          }
          card.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
          card.style.position = 'absolute';
          card.style.left = '0';
          card.style.top = '0';
        });

        if (t >= 1) {
          step++;
          startTime = now;
        }
        animFrameRef.current = requestAnimationFrame(animateShuffle);
      } else {
        cancelAnimationFrame(animFrameRef.current);
        setTimeout(() => {
          const selectedCard = TAROT_CARDS[Math.floor(Math.random() * CARD_COUNT)];
          navigate(`/tarot/single-result/${selectedCard.id}`);
        }, 600);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateShuffle);
  };

  return (
    <div className="tarot-body">
      <Link to="/tarot" className="return-button picker-back-button">← Back</Link>
      <div className="stars" id="stars"></div>
      
      <div className="tarot-container" style={{ paddingTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Cinzel', fontSize: '2.5rem', color: '#f0d0f0', textShadow: '0 0 30px rgba(180,130,200,0.6)' }}>°˖✧ Single Card Reading ✧˖°</h1>
          <p style={{ color: '#d0b0d0', fontStyle: 'italic' }}>One card holds today's message for you</p>
        </div>

        <div className="scp-card-container">
          {!shuffling && (
            <div className="scp-single-card" onClick={startShuffle}>
              <img src={TAROT_BACK} alt="Card Back" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '13px' }} />
            </div>
          )}
          <div className={`scp-deck-container ${shuffling ? 'active' : ''}`} ref={deckRef}></div>
        </div>

        <div className="scp-message-area">
          {!shuffling ? (
            <span className="scp-instruction-text">Click the card to begin</span>
          ) : (
            <span className="scp-shuffle-text active">° Shuffling the mystical deck... °</span>
          )}
        </div>
        {savedCardId !== null && !shuffling && (
          <button type="button" className="return-button" onClick={() => navigate(`/tarot/single-result/${savedCardId}`)}>
            View your saved card
          </button>
        )}
      </div>
    </div>
  );
}

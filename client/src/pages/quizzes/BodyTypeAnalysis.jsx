import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/BodyTypeAnalysis.css';

export default function BodyTypeAnalysis() {
  const navigate = useNavigate();
  const [gender, setGender] = useState('feminine');
  const [selectedBody, setSelectedBody] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
    const userGender = user.gender?.toLowerCase();
    if (userGender === 'masculine' || userGender === 'feminine') {
      setGender(userGender);
    }
  }, []);

  const femCards = [
    { id: 'hourglass', img: '/src/pages/quizzes/assets/fem_hourglass.png', label: 'Hourglass' },
    { id: 'inverted', img: '/src/pages/quizzes/assets/fem_inverted.png', label: 'Inverted Triangle' },
    { id: 'pear', img: '/src/pages/quizzes/assets/fem_pear.png', label: 'Pear' },
    { id: 'rectangle', img: '/src/pages/quizzes/assets/fem_rectangle.png', label: 'Rectangle' },
    { id: 'round', img: '/src/pages/quizzes/assets/fem_round.png', label: 'Round' },
    { id: 'standard', img: '/src/pages/quizzes/assets/fem_standard.png', label: 'Standard' }
  ];

  const mascCards = [
    { id: 'trapezoid', img: '/src/pages/quizzes/assets/masc_trapezoid.png', label: 'Trapezoid' },
    { id: 'rectangle', img: '/src/pages/quizzes/assets/masc_rectangle.png', label: 'Rectangle' },
    { id: 'round', img: '/src/pages/quizzes/assets/masc_round.png', label: 'Round' },
    { id: 'triangle', img: '/src/pages/quizzes/assets/masc_triangle.png', label: 'Triangle' },
    { id: 'inverted', img: '/src/pages/quizzes/assets/masc_inverted.png', label: 'Inverted Triangle' }
  ];

  const cards = gender === 'masculine' ? mascCards : femCards;

  return (
    <div className="bodytype-body">
      <div className="bodytype-bg-accent bodytype-one"></div>
      <div className="bodytype-bg-accent bodytype-two"></div>

      <div className="bodytype-container">
        <h1>Body Type Analysis</h1>
        <p>Select the silhouette that best represents your body shape to personalize your style recommendations.</p>
        
        <div className={`bodytype-grid ${gender === 'masculine' ? 'bodytype-masc-grid' : 'bodytype-fem-grid'}`}>
          {cards.map(card => (
            <div 
              key={card.id} 
              onClick={() => setSelectedBody(card.id)}
              className={`bodytype-card ${selectedBody === card.id ? 'bodytype-selected' : ''}`}
            >
              <img src={card.img} alt={card.label} />
              <div className="bodytype-label">{card.label}</div>
            </div>
          ))}
        </div>

        {selectedBody && (
          <button onClick={() => setShowModal(true)} className="bodytype-continue-btn">
            Continue
          </button>
        )}
      </div>

      {showModal && (
        <div className="bodytype-modal-overlay">
          <div className="bodytype-modal-content">
            <h3>Discover Your Stylistic Vibe</h3>
            <p>
              Every person carries a signature visual rhythm — a harmony between personality, energy, and style. 
              Dress your Personal Mannequin. You can right click to remove unwanted clothing.
            </p>
            <button onClick={() => navigate('/style-quiz')} className="bodytype-modal-btn">
              Go to Style Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
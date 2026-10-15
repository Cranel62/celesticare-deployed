import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/StyleQuiz.css';
import { CLOTHING_SETS } from '../../data/clothingSets';
import { assetUrl } from '../../utils/assetUrls';

const LIMITS = { tops: 2, bottoms: 2, shoes: 1, accessories: 4, dresses: 1 };

// Calibrated coordinate offsets for exact mannequin anatomical alignment
const defaultPositions = {
  fem: {
    tops: { top: '120px', left: '10px' },
    bottoms: { top: '300px', left: '10px' },
    dresses: { top: '110px', left: '10px' },
    shoes: { top: '560px', left: '15px' },
    accessories: { top: '140px', left: '15px' }
  },
  masc: {
    tops: { top: '110px', left: '10px' },
    bottoms: { top: '290px', left: '10px' },
    shoes: { top: '560px', left: '15px' },
    accessories: { top: '130px', left: '15px' }
  }
};

export default function StyleQuiz() {
  const navigate = useNavigate();
  const [gender, setGender] = useState('fem');
  const [droppedItems, setDroppedItems] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState('tops');
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
    const userGender = user.gender?.toLowerCase();
    if (userGender === 'masculine') {
      setGender('masc');
    } else {
      setGender('fem');
    }
  }, []);

  const handleDragStart = (e, item, category) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ ...item, category }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    const categoryCount = droppedItems.filter(i => i.category === data.category).length;
    
    if (categoryCount >= LIMITS[data.category]) {
      alert(`You can only add ${LIMITS[data.category]} ${data.category}`);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 160;
    const y = e.clientY - rect.top - 160;

    setDroppedItems([...droppedItems, { ...data, x, y, id: Date.now() }]);
  };

  const handleItemClick = (item, category) => {
    const categoryCount = droppedItems.filter(i => i.category === category).length;
    if (categoryCount >= LIMITS[category]) {
      alert(`You can only add ${LIMITS[category]} ${category}`);
      return;
    }

    const genderPositions = defaultPositions[gender] || defaultPositions.fem;
    const pos = genderPositions[category] || { top: '150px', left: '10px' };
    
    const x = parseInt(pos.left) || 10;
    const y = parseInt(pos.top) || 150;

    setDroppedItems([
      ...droppedItems, 
      { 
        ...item, 
        category, 
        x, 
        y, 
        id: Date.now() 
      }
    ]);
  };

  const finishQuiz = async () => {
    if (droppedItems.length === 0) return alert("Try dressing your mannequin first!");

    const styleCounts = droppedItems.reduce((acc, item) => {
      acc[item.style] = (acc[item.style] || 0) + 1;
      return acc;
    }, {});
    
    const topStyle = Object.keys(styleCounts).reduce((a, b) => styleCounts[a] > styleCounts[b] ? a : b);

    try {
      await API.post('/outfits/save', {
        outfit_data: droppedItems,
        gender: gender,
        clothing_style: topStyle
      });
      
      const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
      user.style_result = topStyle;
      localStorage.setItem('celesticare_user', JSON.stringify(user));
      
      navigate(`/style-result`);
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save outfit.");
    }
  };

  const mannequinImgSrc = gender === 'fem' 
    ? assetUrl('/src/pages/quizzes/assets/fem_mannequin.png')
    : assetUrl('/src/pages/quizzes/assets/Untitled24_20251020142151.png');

  return (
    <div className="sq-container">
      <div className="sq-bg-accent sq-one"></div>
      <div className="sq-bg-accent sq-two"></div>
      
      <h1 className="sq-title">Dress Your Model</h1>
      <div className="sq-layout">
        
        <div className="sq-canvas-section">
          <div 
            className="sq-canvas" 
            onDragOver={e => e.preventDefault()} 
            onDrop={handleDrop}
          >
            <img src={mannequinImgSrc} className="sq-mannequin" alt="mannequin" />
            
            {droppedItems.map(item => (
              <img 
                key={item.id} src={item.src} alt="clothing"
                onContextMenu={(e) => { e.preventDefault(); setItemsToRemoveState(item.id); }}
                style={{ position: 'absolute', left: `${item.x}px`, top: `${item.y}px`, width: '320px', zIndex: 10, cursor: 'grab' }}
              />
            ))}
          </div>
          <button onClick={() => setDroppedItems([])} className="sq-btn sq-mt-3">Reset</button>
        </div>

        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div className="sq-clothing-container">
            <h2>Choose Your Pieces</h2>
            {['tops', 'bottoms', 'dresses', 'shoes', 'accessories'].map(category => {
              if (category === 'dresses' && gender === 'masc') return null;
              
              const targetCategoryKey = category === 'shoes' ? 'accessories' : (category === 'accessories' ? 'shoes' : category);
              const categoryItems = CLOTHING_SETS[gender]?.[targetCategoryKey] || [];
              
              return (
                <div key={category} className="sq-category sq-mb-3">
                  <h3 onClick={() => setExpandedCategory(expandedCategory === category ? '' : category)}>
                    {category.toUpperCase()} <span>{expandedCategory === category ? '▼' : '▶'}</span>
                  </h3>
                  {expandedCategory === category && (
                    <div className="sq-category-content sq-open">
                      {categoryItems.map((item, i) => (
                        <div key={i} className="sq-item" draggable onDragStart={(e) => handleDragStart(e, item, category)} onClick={() => handleItemClick(item, category)}>
                          <img src={item.src} alt="item" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={finishQuiz} className="sq-finish-btn">
          See My Style
        </button>
      </div>

      {itemToRemove && (
        <div className="sq-modal-overlay">
          <div className="sq-modal-content">
            <div className="sq-modal-header">
              <h3>Remove Item</h3>
            </div>
            <div className="sq-modal-body">
              <p>Are you sure you want to remove this item from your outfit?</p>
            </div>
            <div className="sq-modal-footer">
              <button onClick={() => setItemToRemove(null)} className="sq-btn-cancel">Cancel</button>
              <button onClick={() => { setDroppedItems(droppedItems.filter(i => i.id !== itemToRemove)); setItemToRemove(null); }} className="sq-btn-confirm">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

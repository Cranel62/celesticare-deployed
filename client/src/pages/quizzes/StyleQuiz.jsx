import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/StyleQuiz.css';
import { CLOTHING_SETS, getOutfitAnalysis } from '../../data/clothingSets';
import { assetUrl } from '../../utils/assetUrls';

const LIMITS = { tops: 2, bottoms: 2, shoes: 1, accessories: 4, dresses: 1 };

// Calibrated coordinate offsets for exact mannequin anatomical alignment
const defaultPositions = {
  fem: {
    tops: { top: '66px', left: '10px' },
    bottoms: { top: '120px', left: '10px' },
    dresses: { top: '110px', left: '10px' },
    shoes: { top: '560px', left: '15px' },
    accessories: { top: '140px', left: '15px' }
  },
  masc: {
    tops: { top: '6px', left: '15px' },
    bottoms: { top: '130px', left: '10px' },
    shoes: { top: '560px', left: '15px' },
    accessories: { top: '130px', left: '15px' }
  }
};

// Short and midi dresses have transparent padding sized for their full source
// images. They need a higher placement than floor-length dresses so the
// garment sits on the mannequin's shoulders and waist when selected.
const SHORT_DRESS_NAMES = new Set([
  'Untitled18_20251019111152.png',
  'Untitled18_20251019111157.png',
  'Untitled18_20251019111202.png',
  'Untitled18_20251019111209.png',
  'Untitled18_20251019111226.png',
  'Untitled18_20251019111232.png',
  'Untitled18_Restored2_20251021152843.png',
  'Untitled18_Restored2_20251021152849.png',
  'Untitled18_Restored2_20251021152853.png',
  'Untitled18_Restored2_20251021152922.png',
  'Untitled18_Restored2_20251021152930.png',
  'Untitled18_Restored2_20251021160004.png',
  'Untitled18_Restored2_20251021163927.png'
]);

export default function StyleQuiz() {
  const navigate = useNavigate();
  const [gender, setGender] = useState(() => {
    const user = JSON.parse(localStorage.getItem('celesticare_user') || '{}');
    return user.gender?.toLowerCase() === 'masculine' ? 'masc' : 'fem';
  });
  const [droppedItems, setDroppedItems] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState('tops');
  const [itemToRemove, setItemToRemove] = useState(null);
  const nextItemId = useRef(0);

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

    setDroppedItems([...droppedItems, { ...data, x, y, id: ++nextItemId.current }]);
  };

  const handleItemClick = (item, category) => {
    const categoryCount = droppedItems.filter(i => i.category === category).length;
    if (categoryCount >= LIMITS[category]) {
      alert(`You can only add ${LIMITS[category]} ${category}`);
      return;
    }

    const genderPositions = defaultPositions[gender] || defaultPositions.fem;
    const basePosition = genderPositions[category] || { top: '150px', left: '10px' };
    const pos = gender === 'fem' && category === 'dresses' && SHORT_DRESS_NAMES.has(item.name)
      ? { ...basePosition, top: '0px' }
      : basePosition;
    
    const x = parseInt(pos.left) || 10;
    const y = parseInt(pos.top) || 150;

    setDroppedItems([
      ...droppedItems, 
      { 
        ...item, 
        category, 
        x, 
        y, 
        id: ++nextItemId.current
      }
    ]);
  };

  const finishQuiz = async () => {
    if (droppedItems.length === 0) return alert("Try dressing your mannequin first!");

    const analysis = getOutfitAnalysis(droppedItems);
    const topStyle = analysis.style;

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
      <label className="sq-gender-label">
        Outfit styling
        <select
          className="sq-gender-select"
          value={gender}
          onChange={(event) => {
            setGender(event.target.value);
            setDroppedItems([]);
          }}
        >
          <option value="fem">Feminine styling</option>
          <option value="masc">Masculine styling</option>
        </select>
      </label>
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
                onContextMenu={(e) => { e.preventDefault(); setItemToRemove(item.id); }}
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
              
              const categoryItems = CLOTHING_SETS[gender]?.[category] || [];
              
              return (
                <div key={category} className="sq-category sq-mb-3">
                  <button
                    className="sq-category-toggle"
                    type="button"
                    aria-expanded={expandedCategory === category}
                    onClick={() => setExpandedCategory(expandedCategory === category ? '' : category)}
                  >
                    {category.toUpperCase()} <span>{expandedCategory === category ? '▼' : '▶'}</span>
                  </button>
                  {expandedCategory === category && (
                    <div className="sq-category-content sq-open">
                      {categoryItems.map((item, i) => (
                        <button key={i} type="button" className="sq-item" draggable onDragStart={(e) => handleDragStart(e, item, category)} onClick={() => handleItemClick(item, category)} aria-label={`Add ${item.name} to outfit`}>
                          <img src={item.src} alt="" />
                        </button>
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

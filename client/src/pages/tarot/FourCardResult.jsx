import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import '../../styles/Tarot.css';
import { tarotCardSrc, TAROT_BACK } from '../../utils/tarotImages';

const POSITIONS = {
  past: {
    title: 'The Past',
    icon: '📜',
    element: 'Air',
    question: 'Where are you being called to act quickly?',
    meaning: 'The experiences and choices that shaped the energy you bring into this moment.',
    archetype: 'The Initiator',
    myth: 'A reminder that every journey begins with a first step.',
    style: 'Fast-moving, action-ready pieces',
    tip: 'Choose streamlined, action-ready pieces.'
  },
  heart: {
    title: 'The Heart',
    icon: '💗',
    element: 'Fire',
    question: 'What new passion are you discovering?',
    meaning: 'What your feelings are reaching for, and the desire asking to be acknowledged.',
    archetype: 'The Explorer',
    myth: 'Follow the spark that makes you feel most alive.',
    style: 'Playful, youthful, experimental pieces',
    tip: 'Experiment with style today — try something new.'
  },
  head: {
    title: 'The Head',
    icon: '🧠',
    element: 'Earth',
    question: 'What do you need to balance in your life?',
    meaning: 'The thoughts, plans, and practical perspective shaping your next decision.',
    archetype: 'The Balancer',
    myth: 'Clarity comes when you make room for more than one truth.',
    style: 'Balanced, adaptable, juggling-ready pieces',
    tip: 'Create balanced, adaptable looks.'
  },
  path: {
    title: 'The Path',
    icon: '🌄',
    element: 'Earth',
    question: 'How can you give or receive with grace?',
    meaning: 'The direction available when you bring your heart and head into conversation.',
    archetype: 'The Giver',
    myth: 'Small, generous steps can create lasting abundance.',
    style: 'Generous, balanced, flowing pieces',
    tip: 'Wear something that feels generous.'
  }
};

const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'
];
const SUITS = [
  { name: 'Wands', firstId: 22, element: 'Fire', colors: ['#ff6b35', '#ff8a42', '#ffad5c', '#ffd166'], keywords: 'creativity, passion, momentum' },
  { name: 'Cups', firstId: 36, element: 'Water', colors: ['#62a9df', '#7bc8d1', '#98d8c2', '#b1e3d0'], keywords: 'emotion, connection, intuition' },
  { name: 'Swords', firstId: 50, element: 'Air', colors: ['#9c7bd6', '#b18fe0', '#c5a5e9', '#d9c2f0'], keywords: 'thought, truth, perspective' },
  { name: 'Pentacles', firstId: 64, element: 'Earth', colors: ['#62b899', '#7bcaa7', '#9ad6b9', '#b6e4ce'], keywords: 'growth, stability, abundance' }
];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
const MAJOR_COLORS = ['#9c7bd6', '#ad89dd', '#bd9ce6', '#d4bdec'];

function getCardDetails(value) {
  const id = Number(typeof value === 'object' ? value.id : value);
  if (!Number.isInteger(id) || id < 0 || id > 77) {
    return { name: typeof value === 'object' && value.name ? value.name : 'The Unknown', element: 'Spirit', keywords: 'reflection, possibility, intuition', colors: MAJOR_COLORS };
  }
  if (id < MAJOR_ARCANA.length) {
    return { name: MAJOR_ARCANA[id], element: 'Spirit', keywords: 'change, insight, personal growth', colors: MAJOR_COLORS };
  }
  const suit = SUITS.find(({ firstId }) => id >= firstId && id < firstId + RANKS.length);
  if (!suit) return { name: 'The Unknown', element: 'Spirit', keywords: 'reflection, possibility, intuition', colors: MAJOR_COLORS };
  return {
    name: `${RANKS[id - suit.firstId]} of ${suit.name}`,
    element: suit.element,
    keywords: suit.keywords,
    colors: suit.colors
  };
}

function normalizeCard(card) {
  const details = getCardDetails(card);
  const savedName = typeof card === 'object' ? card.name : '';
  const isPositionLabel = Object.values(POSITIONS).some(({ title }) => title === savedName);
  return { ...details, name: savedName && !isPositionLabel && !/^card\s+\d+$/i.test(savedName) ? savedName : details.name };
}

function getPositionCard(cards, position) {
  const card = cards[position];
  return card === undefined || card === null ? getCardDetails(0) : normalizeCard(card);
}

function CardImage({ card, position, className = '' }) {
  return (
    <img
      className={className}
      src={tarotCardSrc(card.id)}
      alt={`${card.name} — ${POSITIONS[position].title}`}
      onError={event => { event.currentTarget.src = TAROT_BACK; }}
    />
  );
}

function StyleScore({ colors }) {
  return (
    <div className="four-result-swatches" aria-label="Style palette">
      {colors.map(color => <span key={color} style={{ backgroundColor: color }} />)}
    </div>
  );
}

export default function FourCardResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const readingId = searchParams.get('reading_id');
  const [initialSpread] = useState(() => {
    if (readingId) return { cards: null, error: '' };
    const stored = sessionStorage.getItem('heartHeadPathSpread');
    if (!stored) return { cards: null, error: '' };
    try {
      return { cards: JSON.parse(stored), error: '' };
    } catch {
      return { cards: null, error: 'Your selected cards could not be read. Please start a new reading.' };
    }
  });
  const [cards, setCards] = useState(initialSpread.cards);
  const [loadError, setLoadError] = useState(initialSpread.error);

  useEffect(() => {
    document.body.classList.add('four-result-open');
    return () => document.body.classList.remove('four-result-open');
  }, []);

  useEffect(() => {
    if (readingId) {
      API.get(`/tarot/reading/${readingId}`)
        .then(res => {
          const map = {};
          res.data.reading.cards.forEach(card => { map[card.position] = card; });
          setCards(map);
        })
        .catch(err => {
          console.error('Failed to load saved reading:', err);
          setLoadError('This reading could not be loaded. Please try again.');
        });
      return;
    }

    if (!initialSpread.cards && !initialSpread.error) navigate('/tarot/four');
  }, [readingId, navigate, initialSpread.cards, initialSpread.error]);

  useEffect(() => {
    if (readingId || !initialSpread.cards) return;
    const spread = initialSpread.cards;
    API.post('/tarot/save', {
      reading_type: 'heart_path',
      cards: Object.keys(POSITIONS).map(position => ({
        id: Number(spread[position]) || 0,
        name: getCardDetails(spread[position]).name,
        position
      })),
      interpretation: 'Heart and Head synthesized through The Path',
      spread_data: spread
    }).catch(err => console.error('Save spread error:', err));
  }, [readingId, initialSpread.cards]);

  if (loadError) {
    return (
      <main className="tarot-body four-result-page">
        <div className="four-result-error" role="alert">{loadError}</div>
        <Link to="/tarot/four" className="return-button">Start a New Reading</Link>
      </main>
    );
  }
  if (!cards) return null;

  const positions = Object.keys(POSITIONS);
  const selected = Object.fromEntries(positions.map(position => [position, getPositionCard(cards, position)]));
  const dialogue = `Your heart speaks of ${selected.heart.keywords}, while your head considers ${selected.head.keywords}.`;

  return (
    <main className="tarot-body four-result-page">
      <div className="stars" aria-hidden="true" />
      <div className="tarot-container four-result-container">
        <header className="four-result-header">
          <h1>☪ The Heart, Head &amp; Path ☪</h1>
          <p>Three voices speak within you. The cards reveal their wisdom.</p>
        </header>

        <section className="spread-grid four-result-grid" aria-label="Your four-card reading">
          {positions.map(position => {
            const card = selected[position];
            const detail = POSITIONS[position];
            return (
              <article className={`four-card-panel four-card-${position}`} key={position}>
                <header className="four-card-heading">
                  <h2><span aria-hidden="true">{detail.icon}</span>{detail.title}</h2>
                  <span className="four-card-element">{card.element || detail.element}</span>
                </header>

                <div className="four-card-feature">
                  <CardImage card={{ ...card, id: cards[position]?.id ?? cards[position] }} position={position} className="four-card-art" />
                  <div className="four-card-feature-copy">
                    <h3>{card.name}</h3>
                    <p className="four-card-keywords">{card.keywords}</p>
                    <p className="four-card-quote">✦ {detail.myth}</p>
                  </div>
                </div>

                <p className="four-card-meaning"><strong>Meaning:</strong> {detail.meaning}</p>

                <div className="four-card-meta">
                  <div><strong>ARCHETYPE</strong><span>{detail.archetype}, The Seeker</span></div>
                  <div><strong>MYTH</strong><span>{detail.myth}</span></div>
                </div>

                <p className="four-card-question">☁ {detail.question}</p>

                <div className="four-card-style">
                  <h3>✧ STYLE WISDOM</h3>
                  <p>{detail.style}</p>
                  <StyleScore colors={card.colors} />
                  <p className="four-card-tip">✦ {detail.tip}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="tension-section four-dialogue" aria-labelledby="four-dialogue-title">
          <h2 id="four-dialogue-title">⚖ The Inner Dialogue</h2>
          <div className="heart-head-container four-dialogue-pair">
            {['heart', 'head'].map(position => (
              <article className={`four-dialogue-card four-dialogue-${position}`} key={position}>
                <span className="four-dialogue-icon" aria-hidden="true">{POSITIONS[position].icon}</span>
                <h3>{POSITIONS[position].title}</h3>
                <CardImage card={{ ...selected[position], id: cards[position]?.id ?? cards[position] }} position={position} className="four-dialogue-art" />
                <strong>{selected[position].name}</strong>
                <p>{selected[position].keywords}</p>
                <span className="four-dialogue-summary">{position === 'heart' ? 'Wants' : 'Thinks'}: {selected[position].keywords.split(',')[0]}</span>
              </article>
            ))}
            <span className="four-dialogue-vs" aria-label="versus">VS</span>
          </div>
          <p className="four-dialogue-insight">{dialogue}</p>
          <article className="four-path-forward">
            <span className="four-dialogue-icon" aria-hidden="true">{POSITIONS.path.icon}</span>
            <h3>The Path Forward</h3>
            <CardImage card={{ ...selected.path, id: cards.path?.id ?? cards.path }} position="path" className="four-dialogue-art" />
            <strong>{selected.path.name}</strong>
            <p>{selected.path.keywords}</p>
            <p className="four-path-summary">The path offers a third way: {selected.path.keywords}.</p>
          </article>
        </section>

        <section className="four-style-summary" aria-label="Style guidance">
          {[
            { position: 'heart', title: "Heart's Desire", copy: POSITIONS.heart.style, tip: POSITIONS.heart.tip },
            { position: 'head', title: "Head's Logic", copy: POSITIONS.head.style, tip: POSITIONS.head.tip },
            { position: 'path', title: "Path's Integration", copy: POSITIONS.path.style, tip: POSITIONS.path.tip }
          ].map(item => (
            <article className={`four-style-card four-style-${item.position}`} key={item.position}>
              <h3><span aria-hidden="true">{POSITIONS[item.position].icon}</span>{item.title}</h3>
              <CardImage card={{ ...selected[item.position], id: cards[item.position]?.id ?? cards[item.position] }} position={item.position} className="four-style-art" />
              <p>{item.copy}</p>
              <StyleScore colors={selected[item.position].colors} />
              <span>{item.tip}</span>
            </article>
          ))}
        </section>

        <p className="four-result-prompt">How will you honor both your heart and your head today?</p>

        <footer className="four-result-actions">
          <Link to="/tarot/four" className="return-button">← New Reading</Link>
          <button type="button" className="return-button" onClick={() => window.print()}>▣ Print</button>
        </footer>
      </div>
    </main>
  );
}

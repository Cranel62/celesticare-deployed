const inferStyle = (filename, gender) => {
  const n = filename.toLowerCase();
  if (n.includes('business')) return 'businesswear';
  if (n.includes('elegant')) return 'elegant';
  if (n.includes('creative') || n.includes('sexy')) return 'creative';
  if (n.includes('soft') || n.includes('cute')) return 'soft';
  if (n.includes('punk') || n.includes('goth') || n.includes('rough')) return 'rough';
  if (n.includes('basic') || n.includes('polo') || n.includes('minimal')) return 'minimalist';

  // The generated clothing files do not have descriptive names, so classify
  // them by the image set they came from instead of sending every item to
  // Urban Streetwear.
  if (gender === 'fem') {
    if (n.includes('restored2') || n.includes('191111') || n.includes('191112')) return 'elegant';
    if (n.includes('191030') || n.includes('191031')) return 'minimalist';
    return 'soft';
  }

  if (n.includes('untitled23')) return 'casual';
  if (n.includes('untitled18_restored')) return 'minimalist';
  if (n.includes('untitled19')) return 'businesswear';
  return 'casual';
};

const fileName = (path) => path.split('/').pop() || path.split('\\').pop();

const toItems = (modules, gender) =>
  Object.entries(modules).map(([path, src]) => ({
    src,
    style: inferStyle(fileName(path), gender),
    name: fileName(path),
  }));

const femNamed = toItems(import.meta.glob('../pages/quizzes/assets/fem/*.png', { eager: true, import: 'default' }), 'fem')
  .filter((item) => !item.name.startsWith('Untitled'));
const femUntitled = toItems(import.meta.glob('../pages/quizzes/assets/fem/*.png', { eager: true, import: 'default' }), 'fem')
  .filter((item) => item.name.startsWith('Untitled'));
const femEtc = toItems(import.meta.glob('../pages/quizzes/assets/fem/etc/*.png', { eager: true, import: 'default' }), 'fem');
const mascRoot = toItems(import.meta.glob('../pages/quizzes/assets/masc/*.png', { eager: true, import: 'default' }), 'masc');
const mascEtc = toItems(import.meta.glob('../pages/quizzes/assets/masc/etc/*.png', { eager: true, import: 'default' }), 'masc');

const femShoes = femEtc.filter((item) => item.name.toLowerCase().includes('shoe'));
const femAccessories = femEtc.filter((item) => !item.name.toLowerCase().includes('shoe'));
const femBottoms = femUntitled.filter((item) => /190955|190956|191027|191028|191029/.test(item.name));
const femDresses = femUntitled.filter((item) => /restored2|191111|191112/.test(item.name.toLowerCase()));
const femTops = femUntitled.filter((item) => !femBottoms.includes(item) && !femDresses.includes(item));

const mascTops = mascRoot.filter((item) => item.name.includes('Untitled23'));
const mascBottoms = mascRoot.filter((item) => !item.name.includes('Untitled23'));
const getAssetNumber = (name) => Number(name.match(/_(\d+)\.png$/)?.[1] || 0);
const mascShoes = mascEtc.filter((item) => getAssetNumber(item.name) >= 20251020195648);
const mascAccessories = mascEtc.filter((item) => getAssetNumber(item.name) < 20251020195648);

export const CLOTHING_SETS = {
  fem: {
    tops: [...femNamed, ...femTops],
    bottoms: femBottoms,
    dresses: femDresses,
    shoes: femShoes,
    accessories: femAccessories,
  },
  masc: {
    tops: mascTops,
    bottoms: mascBottoms,
    shoes: mascShoes,
    accessories: mascAccessories,
  },
};

export const STYLE_PROFILES = {
  minimalist: { name: 'Minimalist Ease', desc: 'Clean, balanced pieces with a calm and polished feel.', colors: 'White, black, beige, grey', occasions: 'Everyday wear, casual plans' },
  businesswear: { name: 'Polished Classic', desc: 'Structured pieces that create a refined, put-together look.', colors: 'Navy, black, brown, white', occasions: 'Work, meetings, smart events' },
  elegant: { name: 'Romantic Elegance', desc: 'Graceful silhouettes and dressy details create a soft, elevated look.', colors: 'Pastels, jewel tones, cream', occasions: 'Dinners, celebrations, formal events' },
  creative: { name: 'Creative Expression', desc: 'Expressive colors, textures, and statement details make the outfit feel individual.', colors: 'Bright, contrasting, artistic tones', occasions: 'Art events, weekends, social plans' },
  soft: { name: 'Soft Everyday Style', desc: 'Comfortable, gentle pieces with an easy and approachable mood.', colors: 'Pastels, cream, warm neutrals', occasions: 'Coffee dates, relaxed days' },
  rough: { name: 'Edgy Statement Style', desc: 'Dark tones and strong details give the outfit confident edge.', colors: 'Black, charcoal, deep red', occasions: 'Concerts, nights out, street looks' },
  casual: { name: 'Everyday Casual', desc: 'Relaxed separates come together for a practical, comfortable look.', colors: 'Denim, earth tones, easy neutrals', occasions: 'Daily wear, errands, weekends' },
  streetwear: { name: 'Urban Streetwear', desc: 'Urban, trendy, and casual pieces with a city-ready attitude.', colors: 'Black, white, bold accents', occasions: 'City walks, casual outings' },
};

const CATEGORY_LABELS = {
  tops: 'top',
  bottoms: 'bottom',
  dresses: 'dress',
  shoes: 'shoe',
  accessories: 'accessory',
};

export const getOutfitAnalysis = (items = []) => {
  const weights = { tops: 3, bottoms: 2, dresses: 4, shoes: 1, accessories: 1 };
  const scores = {};
  const categoryCounts = {};

  items.forEach((item) => {
    const category = item.category || 'tops';
    const hasGeneratedName = String(item.name || '').toLowerCase().startsWith('untitled');
    const storedStyle = item.style || '';
    const style = storedStyle && !(storedStyle === 'streetwear' && hasGeneratedName)
      ? storedStyle
      : category === 'dresses'
        ? 'elegant'
        : category === 'tops'
          ? 'casual'
          : category === 'bottoms'
            ? 'minimalist'
            : 'businesswear';
    scores[style] = (scores[style] || 0) + (weights[category] || 1);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const style = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || 'casual';
  const profile = STYLE_PROFILES[style] || STYLE_PROFILES.casual;
  const pieces = Object.entries(categoryCounts).map(([category, count]) => {
    const label = CATEGORY_LABELS[category] || category;
    return `${count} ${label}${count === 1 ? '' : 's'}`;
  });

  const pieceDescription = pieces.length ? ` It brings together ${pieces.join(', ')}.` : '';
  return {
    style,
    profile,
    description: `${profile.desc}${pieceDescription}`,
    pieces,
  };
};

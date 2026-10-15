const inferStyle = (filename) => {
  const n = filename.toLowerCase();
  if (n.includes('business')) return 'businesswear';
  if (n.includes('elegant')) return 'elegant';
  if (n.includes('creative') || n.includes('sexy')) return 'creative';
  if (n.includes('soft') || n.includes('cute')) return 'soft';
  if (n.includes('punk') || n.includes('goth') || n.includes('rough')) return 'rough';
  if (n.includes('basic') || n.includes('polo') || n.includes('minimal')) return 'minimalist';
  return 'streetwear';
};

const fileName = (path) => path.split('/').pop() || path.split('\\').pop();

const toItems = (modules) =>
  Object.entries(modules).map(([path, src]) => ({
    src,
    style: inferStyle(fileName(path)),
    name: fileName(path),
  }));

const split = (items, buckets) => {
  const result = Object.fromEntries(buckets.map((b) => [b, []]));
  items.forEach((item, i) => {
    result[buckets[i % buckets.length]].push(item);
  });
  return result;
};

const femNamed = toItems(import.meta.glob('../pages/quizzes/assets/fem/*.png', { eager: true, import: 'default' }))
  .filter((item) => !item.name.startsWith('Untitled'));
const femUntitled = toItems(import.meta.glob('../pages/quizzes/assets/fem/*.png', { eager: true, import: 'default' }))
  .filter((item) => item.name.startsWith('Untitled'));
const femEtc = toItems(import.meta.glob('../pages/quizzes/assets/fem/etc/*.png', { eager: true, import: 'default' }));
const mascRoot = toItems(import.meta.glob('../pages/quizzes/assets/masc/*.png', { eager: true, import: 'default' }));
const mascEtc = toItems(import.meta.glob('../pages/quizzes/assets/masc/etc/*.png', { eager: true, import: 'default' }));

const femShoes = femEtc.filter((item) => item.name.toLowerCase().includes('shoe'));
const femAccessories = femEtc.filter((item) => !item.name.toLowerCase().includes('shoe'));
const femNamedSplit = split(femNamed, ['tops', 'dresses']);
const femUntitledSplit = split(femUntitled, ['tops', 'bottoms', 'dresses']);

const mascTops = mascRoot.filter((item) => item.name.includes('Untitled23'));
const mascBottoms = mascRoot.filter((item) => !item.name.includes('Untitled23'));

export const CLOTHING_SETS = {
  fem: {
    tops: [...femNamedSplit.tops, ...femUntitledSplit.tops],
    bottoms: femUntitledSplit.bottoms,
    dresses: [...femNamedSplit.dresses, ...femUntitledSplit.dresses],
    shoes: femShoes,
    accessories: femAccessories,
  },
  masc: {
    tops: mascTops,
    bottoms: mascBottoms,
    shoes: mascEtc.slice(0, Math.ceil(mascEtc.length / 2)),
    accessories: mascEtc.slice(Math.ceil(mascEtc.length / 2)),
  },
};

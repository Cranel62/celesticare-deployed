export const TAROT_BACK = '/src/assets/images/tarot-back.png';

export function tarotCardSrc(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return TAROT_BACK;
  if (n >= 0 && n <= 21) return `/src/assets/images/Tarots/Major/${n}.jpg`;
  if (n >= 22 && n <= 35) return `/src/assets/images/Tarots/Wands/${n}.jpg`;
  if (n >= 36 && n <= 49) return `/src/assets/images/Tarots/Cups/${n}.jpg`;
  if (n >= 50 && n <= 63) return `/src/assets/images/Tarots/Swords/${n}.jpg`;
  if (n === 73) return `/src/assets/images/Tarots/Pentacles/73.jpeg`;
  if (n >= 64 && n <= 77) return `/src/assets/images/Tarots/Pentacles/${n}.jpg`;
  return TAROT_BACK;
}

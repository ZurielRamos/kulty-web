const STORAGE_KEY = 'kulty_favorites';

export function getFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFavorite(productId: number): void {
  const favs = getFavorites();
  if (!favs.includes(productId)) {
    favs.push(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent('favorites-changed'));
  }
}

export function removeFavorite(productId: number): void {
  const favs = getFavorites().filter((id) => id !== productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  window.dispatchEvent(new CustomEvent('favorites-changed'));
}

export function isFavorite(productId: number): boolean {
  return getFavorites().includes(productId);
}

export function toggleFavorite(productId: number): boolean {
  if (isFavorite(productId)) {
    removeFavorite(productId);
    return false;
  } else {
    addFavorite(productId);
    return true;
  }
}

import { useState, useEffect } from 'react';
import { isFavorite, toggleFavorite } from '../lib/favorites';

interface Props {
  productId: number;
  className?: string;
}

export default function FavoriteButton({ productId, className = '' }: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isFavorite(productId));
    const handler = () => setActive(isFavorite(productId));
    window.addEventListener('favorites-changed', handler);
    // Re-check on View Transitions navigation
    document.addEventListener('astro:page-load', handler);
    return () => {
      window.removeEventListener('favorites-changed', handler);
      document.removeEventListener('astro:page-load', handler);
    };
  }, [productId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(productId);
    setActive(newState);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full bg-black/30 backdrop-blur-sm transition-all ${active ? 'text-red-500 scale-110' : 'text-white hover:text-red-300'} ${className}`}
      title={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <svg
        className="w-5 h-5 drop-shadow-md"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}

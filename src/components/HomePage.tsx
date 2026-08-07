import { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import ProductGrid from './ProductGrid';
import SearchResults from './SearchResults';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Leer query de la URL al montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
      setActiveSearch(q);
    }
    // Focus en el buscador si viene de "Buscar"
    if (params.has('focus')) {
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[type="text"]');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      // Limpiar el param de la URL
      params.delete('focus');
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Sincronizar URL con búsqueda
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeSearch) {
      params.set('q', activeSearch);
    } else {
      params.delete('q');
    }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [activeSearch]);

  // Escuchar navegación atrás/adelante
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        setSearchQuery(q);
        setActiveSearch(q);
      } else {
        setSearchQuery('');
        setActiveSearch('');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setActiveSearch('');
      return;
    }
    const trimmed = query.trim();
    setActiveSearch(trimmed);
    window.history.pushState({}, '', `?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveSearch('');
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <>
      {!activeSearch && (
        <HeroSection
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />
      )}

      {activeSearch ? (
        <SearchResults query={activeSearch} onClear={handleClear} />
      ) : (
        <>
          <div className="px-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Inspiración del día</h2>
          </div>
          <ProductGrid />
        </>
      )}
    </>
  );
}

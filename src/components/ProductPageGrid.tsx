import { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '../config';
import type { PaginatedResponse, Product } from '../types';
import FavoriteButton from './FavoriteButton';

interface BentoItem {
  gridClasses: string;
}

const BENTO_PATTERN: BentoItem[] = [
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
];

const SKELETON_COUNT = 8;

const SIZES = ['35x50', '50x70', '70x100', '100x140'] as const;

interface PriceItem {
  size: string;
  price: number;
}

interface Props {
  product: Product;
  phone: string;
  prices: PriceItem[];
}

export default function ProductPageGrid({ product, phone, prices }: Props) {
  const mainImage = product.gallery[1] || product.gallery[0];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const availableSizes = prices.length > 0 ? prices.map(p => p.size) : ['35x50', '50x70', '70x100', '100x140'];
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[1] || availableSizes[0]);

  const selectedPrice = prices.find(p => p.size === selectedSize)?.price;
  const formattedPrice = selectedPrice
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(selectedPrice)
    : null;

  const [items, setItems] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Carga inicial: búsqueda semántica con embeddingText
  useEffect(() => {
    const loadInitial = async () => {
      const limit = isMobile ? 8 : 20;

      try {
        const res = await fetch(
          `${API_URL}/api/products/similar/${product.id}?limit=${limit}&offset=0`,
        );
        if (res.ok) {
          const data: Product[] = await res.json();
          if (data.length > 0) {
            setItems(data);
            setInitialLoading(false);
            return;
          }
        }

        // Fallback: por categoría
        const fallbackRes = await fetch(
          `${API_URL}/api/products?category=${product.category}&page=1&limit=${limit}`,
        );
        if (fallbackRes.ok) {
          const json: PaginatedResponse = await fallbackRes.json();
          const filtered = json.data.filter((p) => p.id !== product.id);
          setItems(filtered);
          setHasMore(1 < json.totalPages);
        }
      } catch (err) {
        console.error('Error fetching related:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitial();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll infinito: cargar más con embeddings
  const itemsRef = useRef<Product[]>([]);
  itemsRef.current = items;

  const fetchMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const offset = itemsRef.current.length;
    const limit = isMobile ? 8 : 20;

    try {
      const res = await fetch(
        `${API_URL}/api/products/similar/${product.id}?limit=${limit}&offset=${offset}`,
      );
      if (res.ok) {
        const data: Product[] = await res.json();
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setItems((prev) => [...prev, ...data]);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching more:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [product.id, isMobile]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore && !initialLoading) {
          fetchMore();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, initialLoading]);

  const whatsappMessage = `Hola! Me interesa el cuadro "${product.title}" en tamaño ${selectedSize}cm.${formattedPrice ? ` Precio: ${formattedPrice}.` : ''} ¿Está disponible?`;
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      {/* Mobile: card del producto fuera del grid */}
      <div className="md:hidden mb-3">
        <div className="rounded-2xl overflow-hidden relative">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full aspect-[3/4] object-cover"
            style={{ viewTransitionName: `product-${product.id}` }}
          />
          {/* Botón back */}
          <button
            onClick={() => window.history.back()}
            className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Botón favorito */}
          <div className="absolute top-3 right-3">
            <FavoriteButton productId={product.id} size="md" />
          </div>
          {/* Chips flotantes sobre la imagen */}
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            <span className="px-2.5 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm rounded-full text-gray-800 capitalize">
              {product.category}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium bg-white/80 backdrop-blur-sm rounded-full text-gray-800 capitalize">
              {product.style.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="mt-3 space-y-3 px-1">
          <h1 className="text-xl font-bold text-gray-900">{product.title}</h1>
          {product.description && (
            <p className="text-sm text-gray-600">{product.description}</p>
          )}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">Tamaño (cm)</p>
            <div className="flex gap-2 flex-wrap">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    selectedSize === size
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {formattedPrice && (
            <p className="text-2xl font-bold text-gray-900">{formattedPrice}</p>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-4 mb-8 bg-[#25D366] text-white font-medium rounded-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Pedir por WhatsApp
          </a>
        </div>
      </div>

      {/* Grid bento */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 auto-rows-[160px] md:auto-rows-[200px] lg:auto-rows-[220px] gap-2 md:gap-3"
        style={{ gridAutoFlow: 'dense' }}
      >
        {/* Desktop: card del producto dentro del grid */}
        <div className="hidden md:flex col-span-3 row-span-2 2xl:row-span-3 rounded-2xl overflow-hidden">
          <div className="w-1/2 relative">
            <img
              src={mainImage}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ viewTransitionName: `product-${product.id}` }}
            />
            <button
              onClick={() => window.history.back()}
              className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-gray-800 hover:bg-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="w-1/2 bg-white/85 backdrop-blur-xl p-4 lg:p-5 flex flex-col justify-between">
            <div>
              <h1 className="text-lg lg:text-2xl 2xl:text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {product.category} · {product.style.replace('_', ' ')}
              </p>
              {product.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-4">
                  {product.description}
                </p>
              )}
            </div>
            <div>
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1.5">Tamaño (cm)</p>
                <div className="flex gap-1.5 flex-wrap">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                        selectedSize === size
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white/80 text-gray-700 border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {formattedPrice && (
                <p className="text-xl font-bold text-gray-900 mb-3">{formattedPrice}</p>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-[#25D366] text-white text-sm font-medium rounded-xl hover:bg-[#1fb855] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Skeletons mientras carga */}
        {initialLoading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => {
            const pattern = BENTO_PATTERN[i % BENTO_PATTERN.length];
            return (
              <div
                key={`skeleton-${i}`}
                className={`rounded-xl bg-gray-200 animate-pulse ${pattern.gridClasses}`}
              />
            );
          })}

        {/* Productos relacionados */}
        {!initialLoading &&
          items.map((item, index) => {
            const pattern = BENTO_PATTERN[index % BENTO_PATTERN.length];
            const image = item.gallery[1] || item.gallery[0];
            const slug = item.title.replace(/\s+/g, '_') + '-' + item.id;

            return (
              <a
                key={item.id}
                href={`/cuadro/${slug}`}
                className={`relative block rounded-xl overflow-hidden group ${pattern.gridClasses}`}
              >
                <img
                  src={image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </a>
            );
          })}
      </div>

      {/* Sentinel + loader para scroll infinito */}
      {hasMore && !initialLoading && <div ref={sentinelRef} className="h-1" />}
      {loading && (
        <div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 auto-rows-[160px] md:auto-rows-[200px] lg:auto-rows-[220px] gap-2 md:gap-3 mt-2 md:mt-3"
          style={{ gridAutoFlow: 'dense' }}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => {
            const pattern = BENTO_PATTERN[i % BENTO_PATTERN.length];
            return (
              <div
                key={`load-skeleton-${i}`}
                className={`rounded-xl bg-gray-200 animate-pulse ${pattern.gridClasses}`}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

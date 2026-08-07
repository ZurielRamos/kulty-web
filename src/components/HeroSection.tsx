import { useState, useEffect } from 'react';

const PLACEHOLDER_TEXTS = [
  'algo colorido para mi sala...',
  'un bosque neblinoso...',
  'arte abstracto moderno...',
  'decoración estilo japonés...',
  'un cuadro minimalista...',
];

const CHIPS = [
  { label: 'Minimalista' },
  { label: 'Naturaleza' },
  { label: 'Urbano' },
  { label: 'Pop Art' },
  { label: 'B&N' },
  { label: 'Marino' },
  { label: 'Infantil' },
  { label: 'Clásico' },
];

interface Props {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: (query: string) => void;
}

export default function HeroSection({ searchValue, onSearchChange, onSearch }: Props) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative mx-3 mt-3 px-4 pt-12 pb-10 md:pt-16 md:pb-12 overflow-hidden rounded-2xl">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden">
        <img
          src="/hero-bg.webp"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/50" />
      </div>

      {/* Headline */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          Cuadros decorativos
          <span className="block bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            que transforman tu espacio
          </span>
        </h1>
        <p className="mt-3 text-base md:text-lg text-gray-600 max-w-md mx-auto">
          Escribe lo que imaginas y encuentra tu cuadro ideal al instante. Solo describe, nosotros lo encontramos.
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
          <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-100/50">
            <svg className="ml-4 w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch(searchValue)}
              placeholder={`Buscar '${PLACEHOLDER_TEXTS[placeholderIndex]}'`}
              className="flex-1 px-3 py-4 bg-transparent text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              className="mr-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Búsqueda por voz"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chips */}
        <div className="mt-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 justify-center flex-wrap">
            {CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => { onSearchChange(chip.label); onSearch(chip.label); }}
                className="px-3 py-1.5 bg-white/80 border border-gray-100 hover:border-gray-300 hover:shadow-sm rounded-lg text-xs text-gray-600 whitespace-nowrap transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trust cards */}
      <div className="mt-8 max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="flex flex-col items-center gap-2 px-3 py-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375m11.25 0h3.375a1.125 1.125 0 001.125-1.125v-3.375M3.375 14.25V4.875c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v9.375m-15.375 0h15.375m0 0V8.25m0 6h3.375c.621 0 1.125-.504 1.125-1.125V8.25m-4.5 0h4.5m-4.5 0l-4.5-4.5M19.5 8.25l-4.5-4.5" />
          </svg>
          <span className="text-[11px] text-gray-600 text-center font-medium">Envíos a toda Colombia</span>
        </div>
        <div className="flex flex-col items-center gap-2 px-3 py-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
          <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          <span className="text-[11px] text-gray-600 text-center font-medium">Variedad de tamaños</span>
        </div>
        <div className="flex flex-col items-center gap-2 px-3 py-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
          <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          <span className="text-[11px] text-gray-600 text-center font-medium">Pago contra entrega</span>
        </div>
        <div className="flex flex-col items-center gap-2 px-3 py-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
          <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-[11px] text-gray-600 text-center font-medium">Asesoría por WhatsApp</span>
        </div>
      </div>
    </section>
  );
}

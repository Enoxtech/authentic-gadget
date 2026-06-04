"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X, TrendingUp, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  tags: string[];
  rating: number;
}

interface SearchBarProps {
  products: Product[];
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const TRENDING_PRODUCTS = [
  { id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", price: 12499, image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400", category: "smartphones", brand: "Apple", tags: ["phone", "apple", "iphone"], rating: 4.9 },
  { id: "6", name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2", price: 4499, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400", category: "wearables", brand: "Apple", tags: ["watch", "apple", "wearable"], rating: 4.9 },
  { id: "3", name: "MacBook Air M3", slug: "macbook-air-m3", price: 8999, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400", category: "laptops", brand: "Apple", tags: ["laptop", "apple", "macbook"], rating: 4.9 },
];

export default function SearchBar({ products }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        const q = query.toLowerCase();
        const matched = products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        ).slice(0, 6);
        setResults(matched);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
      setActiveIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, products]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node) && !dropdownRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const total = query.trim() ? results.length : TRENDING_PRODUCTS.length;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, total - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && activeIndex >= 0) {
      const items = query.trim() ? results : TRENDING_PRODUCTS;
      window.location.href = `/products/${items[activeIndex].slug}`;
    }
    else if (e.key === "Escape") { setIsOpen(false); inputRef.current?.blur(); }
  };

  // Voice search
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      // Auto-search after voice
      setTimeout(() => {
        const q = transcript.toLowerCase();
        const matched = products.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
        setResults(matched.slice(0, 6));
        setIsOpen(true);
      }, 100);
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const displayItems = query.trim() ? results : TRENDING_PRODUCTS;
  const showResults = isOpen && displayItems.length > 0;
  const showNoResults = isOpen && query.trim().length > 1 && results.length === 0;

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-fog-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] py-3 pl-10 pr-20 text-sm text-fog placeholder:text-fog-muted outline-none transition-all focus:border-gold/30"
          onFocus={e => { if (query.trim().length > 1) setIsOpen(true); e.currentTarget.style.borderColor = 'rgba(212,168,67,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-14 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5 text-fog-muted" />
          </button>
        )}
        {/* Microphone button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          className={`absolute right-3 p-1.5 rounded-xl transition-all ${isListening ? 'mic-active' : 'hover:bg-white/10'}`}
          style={isListening ? { background: 'rgba(167,139,250,0.15)' } : {}}
          title="Voice search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isListening ? '#a78bfa' : 'rgba(167,139,250,0.8)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {showResults && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
          style={{ background: 'rgba(6,17,43,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
          {!query.trim() && (
            <div className="px-4 py-2 border-b border-white/8 flex items-center gap-2 text-xs" style={{ color: 'rgba(212,168,67,0.8)' }}>
              <TrendingUp className="w-3 h-3" /> Trending searches
            </div>
          )}
          {displayItems.map((product, i) => (
            <Link key={product.id} href={`/products/${product.slug}`}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${i === activeIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fog truncate">{product.name}</p>
                <p className="text-xs" style={{ color: 'rgba(212,168,67,0.6)' }}>{product.brand} · {product.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gold">¢{product.price.toLocaleString()}</p>
                <div className="flex items-center gap-0.5 justify-end">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-xs text-fog-muted">{product.rating}</span>
                </div>
              </div>
              {i === activeIndex && <ArrowRight className="w-4 h-4 text-gold shrink-0" />}
            </Link>
          ))}
          <div className="px-4 py-2.5 border-t border-white/8 text-center">
            <Link href={`/products?search=${encodeURIComponent(query)}`} onClick={() => setIsOpen(false)}
              className="text-xs font-medium" style={{ color: '#D4A843' }}>
              See all results for &quot;{query}&quot;
            </Link>
          </div>
        </div>
      )}

      {/* No results */}
      {showNoResults && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 px-6 py-8 text-center"
          style={{ background: 'rgba(6,17,43,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-fog font-medium mb-1">No results for &quot;{query}&quot;</p>
          <p className="text-sm text-fog-muted">Try different keywords or browse categories</p>
          <Link href="/products" onClick={() => setIsOpen(false)} className="mt-3 inline-block text-sm font-medium" style={{ color: '#D4A843' }}>
            Browse all products →
          </Link>
        </div>
      )}
    </div>
  );
}

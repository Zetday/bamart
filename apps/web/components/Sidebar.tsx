'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

interface SidebarProps {
  onPriceFilter: (minPrice: number, maxPrice: number) => void;
  onCategoryFilter?: (category: string) => void;
  onBrandFilter?: (sellerName: string) => void;
  onResetFilters?: () => void;
  isMobile?: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Seller {
  id: number;
  name: string;
}

export default function Sidebar({
  onPriceFilter,
  onCategoryFilter,
  onBrandFilter,
  onResetFilters,
  isMobile = false,
}: SidebarProps) {
  const numberFormatter = useMemo(() => new Intl.NumberFormat('id-ID'), []);

  const searchParams = useSearchParams();
  const selectedBrand = searchParams.get('brand') ?? '';
  const [showMore, setShowMore] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [brands, setBrands] = useState<Seller[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Get initial values from URL
  const urlMinPrice = Number(searchParams.get('minPrice')) || 0;
  const urlMaxPrice = Number(searchParams.get('maxPrice')) || 5000000;

  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);

  const toggleMore = () => setShowMore(!showMore);

  const minSliderRef = useRef<HTMLInputElement | null>(null);
  const maxSliderRef = useRef<HTMLInputElement | null>(null);

  // Check if any filter is active
  const hasActiveFilters =
    searchParams.get('search') ||
    searchParams.get('category') ||
    searchParams.get('brand') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice');

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        const catsList = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setCategories(catsList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Fetch brands from API
  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch('/api/brands');
        const data = await res.json();
        const brandsList = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setBrands(brandsList);
      } catch (err) {
        console.error('Error fetching brands', err);
      } finally {
        setLoadingBrands(false);
      }
    }

    fetchBrands();
  }, []);

  // Handle category click
  const handleCategoryClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    category: string
  ) => {
    e.preventDefault();
    if (onCategoryFilter) {
      onCategoryFilter(category);
    }
  };

  // Handle brand click
  const handleBrandChange = (sellerName: string) => {
    if (onBrandFilter) {
      onBrandFilter(sellerName);
    }
  };

  // Update slider background gradients
  useEffect(() => {
    const minPercent = (minPrice / 5000000) * 100;
    const maxPercent = (maxPrice / 5000000) * 100;

    if (maxSliderRef.current) {
      const gradient = `linear-gradient(to right, 
        #cbd5e1 0%, 
        #cbd5e1 ${minPercent}%, 
        #7D1972 ${minPercent}%, 
        #7D1972 ${maxPercent}%, 
        #cbd5e1 ${maxPercent}%, 
        #cbd5e1 100%)`;
      maxSliderRef.current.style.background = gradient;
    }
  }, [minPrice, maxPrice]);

  // Handle Go button click
  const handleApplyFilter = () => {
    onPriceFilter(minPrice, maxPrice);
  };

  const wrapperClass = isMobile
    ? 'flex-1 overflow-hidden pr-5 pl-8 py-8 space-y-6 bg-white dark:bg-slate-900'
    : hasActiveFilters
    ? 'w-full pr-5 pl-8 py-8 space-y-6 bg-white dark:bg-slate-900'
    : 'fixed top-20 left-0 h-[calc(100vh-5rem)] w-72 overflow-hidden pr-5 pl-8 py-8 space-y-6 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50';

  const renderContent = () => (
    <div className={wrapperClass}>
      {/* ===== RESET FILTER BUTTON ===== */}
      {hasActiveFilters && onResetFilters && (
        <div>
          <button
            onClick={onResetFilters}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold text-xs"
          >
            Reset Semua Filter
          </button>
          <hr className="mt-4 border-slate-100 dark:border-slate-800/80" />
        </div>
      )}

      {/* ===== PRODUK UMKM ===== */}
      <div>
        <h2 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">
          Jelajahi Produk UMKM
        </h2>

        <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
          {loadingCategories ? (
            <p className="text-slate-400 dark:text-slate-500 text-xs">Memuat kategori...</p>
          ) : categories.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-500 text-xs">Tidak ada kategori</p>
          ) : (
            categories.slice(0, 3).map((category) => (
              <a
                key={category.id}
                href="#"
                onClick={(e) => handleCategoryClick(e, category.name)}
                className="block hover:underline hover:text-[#7D1972] dark:hover:text-fuchsia-400 hover:translate-x-0.5 transition-all duration-150"
              >
                {category.name}
              </a>
            ))
          )}
        </div>

        <hr className="mt-4 border-slate-100 dark:border-slate-800/80" />
      </div>

      {/* ===== HARGA ===== */}
      <div>
        <h3 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">Harga</h3>
        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-3">
          Rp{numberFormatter.format(minPrice)} – Rp
          {numberFormatter.format(maxPrice)}
          {maxPrice >= 5000000 ? '+' : ''}
        </p>

        {/* PRICE RANGE COMPONENT - Amazon Style */}
        <div className="relative mb-6">
          <div className="s-range-container">
            {/* MIN SLIDER */}
            <div className="s-range-input-container s-lower-bound">
              <input
                ref={minSliderRef}
                type="range"
                className="s-range-input"
                min={0}
                max={5000000}
                value={minPrice}
                step={10000}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v < maxPrice) setMinPrice(v);
                }}
                aria-label="Minimum price"
                aria-valuemin={0}
                aria-valuenow={minPrice}
                aria-valuemax={5000000}
              />
            </div>

            {/* MAX SLIDER */}
            <div className="s-range-input-container s-upper-bound">
              <input
                ref={maxSliderRef}
                type="range"
                className="s-range-input"
                min={0}
                max={5000000}
                value={maxPrice}
                step={10000}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v > minPrice) setMaxPrice(v);
                }}
                aria-label="Maximum price"
                aria-valuemin={0}
                aria-valuenow={maxPrice}
                aria-valuemax={5000000}
              />
            </div>
          </div>

          <button
            onClick={handleApplyFilter}
            className="mt-3 px-4 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-[#7D1972] hover:text-[#7D1972] dark:hover:border-fuchsia-500 dark:hover:text-fuchsia-400 transition-colors cursor-pointer"
          >
            Terapkan
          </button>
        </div>
        <hr className="mt-4 border-slate-100 dark:border-slate-800/80" />
      </div>

      {/* ===== PROMO ===== */}
      <div>
        <h3 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">
          Promo & Diskon
        </h3>
        <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
          <a href="#" className="block hover:underline hover:text-[#7D1972] dark:hover:text-fuchsia-400">
            Semua Promo
          </a>
          <a href="#" className="block hover:underline hover:text-[#7D1972] dark:hover:text-fuchsia-400">
            Produk Diskon Hari Ini
          </a>
          <a href="#" className="block hover:underline hover:text-[#7D1972] dark:hover:text-fuchsia-400">
            Gratis Ongkir
          </a>
        </div>
        <hr className="mt-4 border-slate-100 dark:border-slate-800/80" />
      </div>

      {/* ===== ULASAN ===== */}
      <div>
        <h3 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">
          Ulasan Pelanggan
        </h3>
        <div className="flex items-center gap-1.5 text-amber-500 text-sm font-semibold">
          <div className="flex items-center gap-0.5">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <span className="text-slate-650 dark:text-slate-350">& Up</span>
        </div>
        <hr className="mt-4 border-slate-100 dark:border-slate-800/80" />
      </div>

      {/* ===== KATEGORI ===== */}
      <div>
        <h3 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">Kategori UMKM</h3>
        <div className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
          {loadingCategories ? (
            <p className="text-slate-400 dark:text-slate-500 text-xs">Memuat kategori...</p>
          ) : categories.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-500 text-xs">Tidak ada kategori</p>
          ) : (
            <>
              {categories.slice(0, 4).map((category) => (
                <a
                  key={category.id}
                  href="#"
                  onClick={(e) => handleCategoryClick(e, category.name)}
                  className="block hover:underline hover:text-[#7D1972] dark:hover:text-fuchsia-400 hover:translate-x-0.5 transition-all duration-150"
                >
                  {category.name}
                </a>
              ))}

              {categories.length > 4 && (
                <>
                  <button
                    onClick={toggleMore}
                    className="flex items-center gap-1 text-[#7D1972] dark:text-fuchsia-450 hover:underline text-xs font-semibold"
                  >
                    <span>Lainnya</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${
                        showMore ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showMore && (
                    <div className="pl-2 pt-1.5 space-y-1.5 border-l border-slate-100 dark:border-slate-800">
                      {categories.slice(4).map((category) => (
                        <a
                          key={category.id}
                          href="#"
                          onClick={(e) => handleCategoryClick(e, category.name)}
                          className="block hover:underline hover:text-[#7D1972] dark:hover:text-fuchsia-400 hover:translate-x-0.5 transition-all duration-150"
                        >
                          {category.name}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
        <hr className="mt-4 border-slate-100 dark:border-slate-800/80" />
      </div>

      {/* ===== BRAND ===== */}
      <div className="pb-4">
        <h3 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-2.5">
          Brand Lokal Populer
        </h3>

        <div className="space-y-2">
          {loadingBrands ? (
            <p className="text-slate-400 dark:text-slate-500 text-xs">Memuat brand...</p>
          ) : brands.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-500 text-xs">Belum ada seller</p>
          ) : (
            brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand.name}
                  checked={selectedBrand === brand.name}
                  onChange={() => handleBrandChange(brand.name)}
                  className="h-4 w-4 accent-[#7D1972] cursor-pointer"
                />
                <span className="hover:text-[#7D1972] dark:hover:text-fuchsia-400 transition-colors">{brand.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* AMAZON-STYLE SLIDER CSS */}
      <style jsx>{`
        .s-range-container {
          position: relative;
          height: 32px;
          width: 100%;
        }

        .s-range-input-container {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .s-range-input {
          position: absolute;
          width: 100%;
          height: 6px;
          top: 50%;
          transform: translateY(-50%);
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background: transparent;
          outline: none;
        }

        /* Lower bound slider - bottom layer */
        .s-lower-bound .s-range-input {
          background: transparent;
          border-radius: 3px;
          z-index: 3;
          pointer-events: none;
        }

        /* Upper bound slider - has the gradient, on top */
        .s-upper-bound .s-range-input {
          z-index: 2;
          border-radius: 3px;
          background: #cbd5e1;
          pointer-events: none;
        }

        /* Webkit (Chrome, Safari, Edge) - Thumb */
        .s-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 24px;
          height: 24px;
          background: #7D1972;
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          position: relative;
        }

        .s-range-input::-webkit-slider-thumb:hover {
          background: #65145c;
        }

        /* Firefox - Thumb */
        .s-range-input::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          background: #7D1972;
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          position: relative;
        }

        .s-range-input::-moz-range-thumb:hover {
          background: #65145c;
        }

        /* Firefox - Remove default track */
        .s-range-input::-moz-range-track {
          background: transparent;
          border: none;
        }

        /* Remove focus outline */
        .s-range-input:focus {
          outline: none;
        }

        .s-range-input:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(125, 25, 114, 0.2),
            0 1px 4px rgba(0, 0, 0, 0.3);
        }

        .s-range-input:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(125, 25, 114, 0.2),
            0 1px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );

  if (isMobile) {
    return renderContent();
  }

  return (
    <aside className={
      hasActiveFilters
        ? "hidden md:block w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 min-h-screen"
        : "hidden md:block w-72 bg-white dark:bg-slate-900"
    }>
      {renderContent()}
    </aside>
  );
}

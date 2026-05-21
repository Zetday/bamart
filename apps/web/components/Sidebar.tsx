'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

interface SidebarProps {
  onPriceFilter: (minPrice: number, maxPrice: number) => void;
  onCategoryFilter?: (category: string) => void;
  onBrandFilter?: (sellerName: string) => void;
  onResetFilters?: () => void;
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
        setCategories(data);
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
        setBrands(data);
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
        #bbbfbf 0%, 
        #bbbfbf ${minPercent}%, 
        #0A9A4C ${minPercent}%, 
        #0A9A4C ${maxPercent}%, 
        #bbbfbf ${maxPercent}%, 
        #bbbfbf 100%)`;
      maxSliderRef.current.style.background = gradient;
    }
  }, [minPrice, maxPrice]);

  // Handle Go button click
  const handleApplyFilter = () => {
    onPriceFilter(minPrice, maxPrice);
  };

  return (
    <aside className="hidden md:block w-72 bg-white border-r border-gray-300">
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 overflow-y-auto pr-5 pl-8 py-8 space-y-6 bg-white">
        {/* ===== RESET FILTER BUTTON ===== */}
        {hasActiveFilters && onResetFilters && (
          <div>
            <button
              onClick={onResetFilters}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium text-sm"
            >
              Reset Semua Filter
            </button>
            <hr className="mt-4 border-gray-300" />
          </div>
        )}

        {/* ===== PRODUK UMKM ===== */}
        <div>
          <h2 className="font-bold text-gray-900 text-sm mb-2">
            Jelajahi Produk UMKM Banjarmasin
          </h2>

          <div className="space-y-1 text-sm text-gray-700">
            {loadingCategories ? (
              <p className="text-gray-400">Memuat kategori...</p>
            ) : categories.length === 0 ? (
              <p className="text-gray-400">Tidak ada kategori</p>
            ) : (
              categories.slice(0, 3).map((category) => (
                <a
                  key={category.id}
                  href="#"
                  onClick={(e) => handleCategoryClick(e, category.name)}
                  className="block hover:underline"
                >
                  {category.name}
                </a>
              ))
            )}
          </div>

          <hr className="mt-4 border-gray-300" />
        </div>

        {/* ===== HARGA ===== */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm">Harga</h3>
          <p className="font-bold text-black mb-3">
            Rp{numberFormatter.format(minPrice)} – Rp
            {numberFormatter.format(maxPrice)}
            {maxPrice >= 5000000 ? '+' : ''}
          </p>

          {/* PRICE RANGE COMPONENT - Amazon Style */}
          <div className="relative mb-8">
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
              className="mt-3 px-4 py-1.5 text-sm border border-gray-400 rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              Terapkan
            </button>
          </div>
        </div>

        {/* ===== PROMO ===== */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm">
            Promo & Diskon
          </h3>
          <a href="#" className="block hover:underline text-sm">
            Semua Promo
          </a>
          <a href="#" className="block hover:underline text-sm">
            Produk Diskon Hari Ini
          </a>
          <a href="#" className="block hover:underline text-sm">
            Gratis Ongkir
          </a>
        </div>

        {/* ===== ULASAN ===== */}
        <div>
          <h3 className="font-bold text-gray-900 mb-1 text-sm">
            Ulasan Pelanggan
          </h3>
          <div className="flex items-center gap-1 text-orange-500 text-sm">
            ⭐⭐⭐⭐⭐ <span className="text-gray-700">& Up</span>
          </div>
        </div>

        {/* ===== KATEGORI ===== */}
        <h3 className="font-bold text-gray-900 mb-2 text-sm">Kategori UMKM</h3>
        <div className="space-y-1 text-sm text-gray-700">
          {loadingCategories ? (
            <p className="text-gray-400">Memuat kategori...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-400">Tidak ada kategori</p>
          ) : (
            <>
              {categories.slice(0, 4).map((category) => (
                <a
                  key={category.id}
                  href="#"
                  onClick={(e) => handleCategoryClick(e, category.name)}
                  className="block hover:underline"
                >
                  {category.name}
                </a>
              ))}

              {categories.length > 4 && (
                <>
                  <button
                    onClick={toggleMore}
                    className="flex items-center gap-1 text-green-600 hover:underline"
                  >
                    <span>Lainnya</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
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
                    <div className="pl-2 space-y-1">
                      {categories.slice(4).map((category) => (
                        <a
                          key={category.id}
                          href="#"
                          onClick={(e) => handleCategoryClick(e, category.name)}
                          className="block hover:underline"
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

        {/* ===== BRAND ===== */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm">
            Brand Lokal Populer
          </h3>

          {loadingBrands ? (
            <p className="text-gray-400 text-sm">Memuat brand...</p>
          ) : brands.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada seller</p>
          ) : (
            brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand.name}
                  checked={selectedBrand === brand.name}
                  onChange={() => handleBrandChange(brand.name)}
                  className="h-4 w-4 accent-green-600"
                />
                {brand.name}
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
          background: #bbbfbf;
          pointer-events: none;
        }

        /* Webkit (Chrome, Safari, Edge) - Thumb */
        .s-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 28px;
          height: 28px;
          background: #0a9a4c;
          border: 5px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          position: relative;
        }

        .s-range-input::-webkit-slider-thumb:hover {
          background: #088a42;
        }

        /* Firefox - Thumb */
        .s-range-input::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          background: #0a9a4c;
          border: 5px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          position: relative;
        }

        .s-range-input::-moz-range-thumb:hover {
          background: #088a42;
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
          box-shadow: 0 0 0 3px rgba(10, 154, 76, 0.2),
            0 1px 4px rgba(0, 0, 0, 0.3);
        }

        .s-range-input:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(10, 154, 76, 0.2),
            0 1px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </aside>
  );
}

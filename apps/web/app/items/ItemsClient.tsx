'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ItemCard from '@/components/ItemCard';
import ItemCardSkeleton from '@/components/skeleton/ItemCardSkeleton';

interface ItemWithCategory {
  id: number;
  name: string;
  price: number;
  stock: number;
  seller: string;
  userId: number;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  categoryId: number | null;
}

export default function ItemsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ==============================
        NUMBER FORMATTER (FIX)
     ============================== */
  const numberFormatter = useMemo(() => new Intl.NumberFormat('id-ID'), []);

  /* ------------------------------
        FETCH ITEMS
  ------------------------------ */
  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();
        const itemsList = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setItems(itemsList);
        setFilteredItems(itemsList);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  /* ----------------------------------------
      FILTER BASED ON URL PARAMETERS
  ---------------------------------------- */
  useEffect(() => {
    let filtered = [...items];

    const searchQuery = searchParams.get('search')?.trim() ?? '';
    const category = searchParams.get('category')?.trim() ?? '';
    const brand = searchParams.get('brand')?.trim() ?? '';

    const minParam = searchParams.get('minPrice');
    const maxParam = searchParams.get('maxPrice');

    const minPrice = minParam !== null ? Number(minParam) : 0;
    const maxPrice = maxParam !== null ? Number(maxParam) : 5000000;

    if (searchQuery !== '') {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description ?? '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (category !== '') {
      filtered = filtered.filter(
        (item) => (item.category ?? '').toLowerCase() === category.toLowerCase()
      );
    }

    if (brand !== '') {
      filtered = filtered.filter(
        (item) => item.seller.toLowerCase() === brand.toLowerCase()
      );
    }

    // UPDATED: Jika maxPrice adalah 5000000 (max), tampilkan semua produk >= minPrice
    if (maxPrice >= 5000000) {
      filtered = filtered.filter((item) => item.price >= minPrice);
    } else {
      filtered = filtered.filter(
        (item) => item.price >= minPrice && item.price <= maxPrice
      );
    }

    setFilteredItems(filtered);
  }, [searchParams, items]);

  /* ----------------------------------------
      HANDLERS
  ---------------------------------------- */
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePriceFilter = (minPrice: number, maxPrice: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('minPrice', String(minPrice));
    params.set('maxPrice', String(maxPrice));
    router.push(`/items?${params.toString()}`);
    scrollToTop();
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`/items?${params.toString()}`);
    scrollToTop();
  };

  const handleBrandFilter = (brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('brand', brand);
    router.push(`/items?${params.toString()}`);
    scrollToTop();
  };

  const handleResetFilters = () => {
    router.push('/items');
    scrollToTop();
  };

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      params.delete(key);
    }
    router.push(`/items?${params.toString()}`);
    scrollToTop();
  };

  const hasActiveFilters =
    searchParams.get('search') ||
    searchParams.get('category') ||
    searchParams.get('brand') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice');

  /* ------------------------------
        LOADING SCREEN
  ------------------------------ */
  if (loading) {
    return (
      <div className="flex pt-16 md:pt-20 md:pl-8 min-h-screen bg-slate-50/30 dark:bg-slate-950/10 w-full">
        <aside className="w-64 hidden md:block shrink-0 min-h-screen">
          <Sidebar
            onPriceFilter={handlePriceFilter}
            onCategoryFilter={handleCategoryFilter}
            onResetFilters={handleResetFilters}
          />
        </aside>
        <main className="flex-1 px-4 md:px-6 pt-3 md:pt-4 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  /* ------------------------------
        UI
  ------------------------------ */
  return (
    <div className={`flex pt-16 md:pt-20 min-h-screen bg-slate-50/30 dark:bg-slate-950/10 w-full ${!hasActiveFilters ? 'md:pl-8' : ''}`}>
      
      {/* Mobile Drawer Backdrop */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 flex flex-col md:hidden
          transition-transform duration-300 ease-in-out shadow-2xl pt-16
          ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={() => setIsFilterOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
        >
          ✕
        </button>
        <Sidebar
          isMobile
          onPriceFilter={(min, max) => {
            handlePriceFilter(min, max);
            setIsFilterOpen(false);
          }}
          onCategoryFilter={(cat) => {
            handleCategoryFilter(cat);
            setIsFilterOpen(false);
          }}
          onBrandFilter={(b) => {
            handleBrandFilter(b);
            setIsFilterOpen(false);
          }}
          onResetFilters={() => {
            handleResetFilters();
            setIsFilterOpen(false);
          }}
        />
      </aside>

      {/* Desktop Sidebar Column */}
      {!hasActiveFilters ? (
        <aside className="w-64 hidden md:block shrink-0 min-h-screen">
          <Sidebar
            onPriceFilter={handlePriceFilter}
            onCategoryFilter={handleCategoryFilter}
            onBrandFilter={handleBrandFilter}
            onResetFilters={handleResetFilters}
          />
        </aside>
      ) : (
        <Sidebar
          onPriceFilter={handlePriceFilter}
          onCategoryFilter={handleCategoryFilter}
          onBrandFilter={handleBrandFilter}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-6 pt-3 md:pt-4 pb-6">
        {/* Mobile Filter & Controls Bar */}
        <div className="flex md:hidden items-center justify-between gap-4 mb-5 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7D1972] hover:bg-[#9E1E93] text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Filter & Kategori</span>
          </button>
          {searchParams.get('search') && (
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              {filteredItems.length} Produk
            </span>
          )}
        </div>

        {/* Active Filter Tags Status Bar */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            {searchParams.get('search') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-fuchsia-50 text-[#7D1972] border border-fuchsia-100 rounded-full text-xs font-bold dark:bg-fuchsia-950/20 dark:text-fuchsia-300 dark:border-fuchsia-900/30">
                <span>Cari: &quot;{searchParams.get('search')}&quot;</span>
                <button
                  onClick={() => clearFilter('search')}
                  className="hover:text-red-500 text-xs font-extrabold ml-0.5 cursor-pointer font-mono"
                  aria-label="Remove search filter"
                >
                  ✕
                </button>
              </span>
            )}

            {searchParams.get('category') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-bold dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30">
                <span>Kategori: {searchParams.get('category')}</span>
                <button
                  onClick={() => clearFilter('category')}
                  className="hover:text-red-500 text-xs font-extrabold ml-0.5 cursor-pointer font-mono"
                  aria-label="Remove category filter"
                >
                  ✕
                </button>
              </span>
            )}

            {searchParams.get('brand') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-bold dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30">
                <span>Brand: {searchParams.get('brand')}</span>
                <button
                  onClick={() => clearFilter('brand')}
                  className="hover:text-red-500 text-xs font-extrabold ml-0.5 cursor-pointer font-mono"
                  aria-label="Remove brand filter"
                >
                  ✕
                </button>
              </span>
            )}

            {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-150 rounded-full text-xs font-bold dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30">
                <span>
                  Harga: Rp{numberFormatter.format(Number(searchParams.get('minPrice') ?? 0))} — Rp{numberFormatter.format(Number(searchParams.get('maxPrice') ?? 5000000))}
                  {Number(searchParams.get('maxPrice') ?? 5000000) >= 5000000 ? '+' : ''}
                </span>
                <button
                  onClick={() => clearFilter('price')}
                  className="hover:text-red-500 text-xs font-extrabold ml-0.5 cursor-pointer font-mono"
                  aria-label="Remove price filter"
                >
                  ✕
                </button>
              </span>
            )}

            {searchParams.get('search') && (
              <span className="text-slate-500 dark:text-slate-400 text-xs font-bold hidden md:inline ml-1">
                ({filteredItems.length} produk ditemukan)
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="ml-auto px-3.5 py-1 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-full transition duration-150 flex items-center gap-1 cursor-pointer"
            >
              Reset Semua
            </button>
          </div>
        )}

        {/* PRODUCT GRID OR EMPTY STATE */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs px-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 text-slate-400 border border-slate-100 dark:border-slate-800">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">Produk Tidak Ditemukan</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
              Maaf, kami tidak menemukan produk yang cocok dengan kombinasi filter Anda saat ini. Silakan coba atur ulang pencarian atau filter Anda.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-6 px-5 py-2.5 bg-[#7D1972] hover:bg-[#9E1E93] text-white text-xs font-bold rounded-xl transition duration-200 cursor-pointer shadow-xs"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

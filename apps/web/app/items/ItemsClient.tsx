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
  const handlePriceFilter = (minPrice: number, maxPrice: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('minPrice', String(minPrice));
    params.set('maxPrice', String(maxPrice));
    router.push(`/items?${params.toString()}`);
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`/items?${params.toString()}`);
  };

  const handleBrandFilter = (brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('brand', brand);
    router.push(`/items?${params.toString()}`);
  };

  const handleResetFilters = () => router.push('/items');

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
      <div className="flex pt-15 md:pl-8">
        <aside className="w-64 hidden md:block min-h-screen">
          <Sidebar
            onPriceFilter={handlePriceFilter}
            onCategoryFilter={handleCategoryFilter}
            onResetFilters={handleResetFilters}
          />
        </aside>
        <main className="flex-1 p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
    <div className="flex md:pl-8">
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
          fixed top-0 bottom-0 left-0 w-72 bg-white z-50 flex flex-col md:hidden
          transition-transform duration-300 ease-in-out shadow-2xl pt-16
          ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={() => setIsFilterOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm font-semibold cursor-pointer"
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

      <aside className="w-64 hidden md:block min-h-screen">
        <Sidebar
          onPriceFilter={handlePriceFilter}
          onCategoryFilter={handleCategoryFilter}
          onBrandFilter={handleBrandFilter}
          onResetFilters={handleResetFilters}
        />
      </aside>

      <main className="flex-1 p-6">
        {/* Mobile filter bar */}
        <div className="flex md:hidden items-center justify-between gap-4 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7D1972] text-white rounded-lg text-sm font-semibold hover:bg-[#9c2292] transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filter & Kategori
          </button>
          <span className="text-gray-500 text-sm">
            ({filteredItems.length} produk)
          </span>
        </div>
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          {searchParams.get('search') && (
            <p className="text-gray-600">
              Hasil pencarian untuk:{' '}
              <strong>{searchParams.get('search')}</strong>
            </p>
          )}

          {searchParams.get('category') && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {searchParams.get('category')}
            </span>
          )}

          {searchParams.get('brand') && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {searchParams.get('brand')}
            </span>
          )}

          {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Rp
              {numberFormatter.format(
                Number(searchParams.get('minPrice') ?? 0)
              )}{' '}
              — Rp
              {numberFormatter.format(
                Number(searchParams.get('maxPrice') ?? 5000000)
              )}
              {Number(searchParams.get('maxPrice') ?? 5000000) >= 5000000
                ? '+'
                : ''}
            </span>
          )}

          <span className="text-gray-500 text-sm hidden md:inline">
            ({filteredItems.length} produk)
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="ml-auto px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </main>
    </div>
  );
}

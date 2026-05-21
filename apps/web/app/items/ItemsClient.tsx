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
        setItems(data);
        setFilteredItems(data);
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
    <div className="flex pt-15 md:pl-8">
      <aside className="w-64 hidden md:block min-h-screen">
        <Sidebar
          onPriceFilter={handlePriceFilter}
          onCategoryFilter={handleCategoryFilter}
          onBrandFilter={handleBrandFilter}
          onResetFilters={handleResetFilters}
        />
      </aside>

      <main className="flex-1 p-6">
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

          <span className="text-gray-500 text-sm">
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

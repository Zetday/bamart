import { Suspense } from 'react';
import ItemsClient from './ItemsClient';

export default function ItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex pt-15">
          <aside className="w-64 hidden md:block min-h-screen" />
          <main className="flex-1 p-6 text-center text-gray-500">
            Memuat produk...
          </main>
        </div>
      }
    >
      <ItemsClient />
    </Suspense>
  );
}

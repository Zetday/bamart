import { Suspense } from 'react';
import SuccessClient from './SuccessClient';

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-500">
          Memuat status transaksi...
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}

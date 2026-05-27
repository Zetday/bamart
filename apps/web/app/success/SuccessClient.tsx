'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderSuccessSkeleton from '@/components/skeleton/OrderSuccessSkeleton';

interface OrderData {
  id: number;
  orderDate: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  totalPrice: number;
}

export default function OrderSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get('orderId');

  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      const res = await fetch(`/api/order/detail?orderId=${orderId}`);
      const data = await res.json();
      setOrder(data.order || null);
    }
    load();
  }, [orderId]);

  if (!order) {
    return <OrderSuccessSkeleton />;
  }

  const formattedDate = new Date(order.orderDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 sm:pt-24 pb-16 dark:bg-gray-900 flex items-center justify-center">
      <div className="mx-auto max-w-2xl px-4 w-full">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-8 flex flex-col items-center">
          {/* ICON SUCCESS */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-6 animate-bounce dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-400">
            <svg
              className="w-12 h-12"
              fill="none; currentColor"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* TITLE */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Terima kasih atas pesanan Anda!
          </h2>

          {/* SUBTEXT */}
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8 max-w-md leading-relaxed">
            Pesanan <span className="font-bold text-gray-900 dark:text-white">#{order.id}</span> berhasil dibuat. Kami akan menghubungi Anda setelah pesanan siap dikirim.
          </p>

          {/* DETAIL BOX */}
          <div className="w-full space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Tanggal</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Nama Penerima</span>
              <span className="font-semibold text-gray-900 dark:text-white">{order.fullName}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Alamat</span>
              <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[180px] sm:max-w-xs truncate">
                {order.address}, {order.city}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Telepon</span>
              <span className="font-semibold text-gray-900 dark:text-white">{order.phone}</span>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div className="flex items-center justify-between pt-1">
              <span className="text-base font-extrabold text-gray-900 dark:text-white">Total Tagihan</span>
              <span className="text-lg font-black text-[#7D1972] dark:text-fuchsia-400">
                Rp {order.totalPrice.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full justify-center">
            <Link
              href={`/orders`}
              className="flex items-center justify-center rounded-xl py-3 px-6 text-sm font-bold text-white bg-[#7D1972] hover:bg-[#9E1E93] hover:shadow transition duration-200"
            >
              Lihat Riwayat Pesanan
            </Link>

            <Link
              href="/items"
              className="flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-bold text-[#7D1972] bg-white border-2 border-[#7D1972] hover:bg-fuchsia-50/40 dark:bg-gray-800 dark:hover:bg-gray-700 transition duration-200"
            >
              Kembali Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

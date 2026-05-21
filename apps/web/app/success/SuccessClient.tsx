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
    <div className="pt-24 bg-white py-8 md:py-16 mt-20 flex justify-center">
      <div className="max-w-2xl px-4 2xl:px-0">
        {/* ICON SUCCESS */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center 
                          animate-bounce"
          >
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* TITLE */}
        <h2
          className="text-xl font-semibold text-gray-900 sm:text-2xl mb-2 text-center 
                       animate-fade-in"
        >
          Terima kasih atas pesanan Anda!
        </h2>

        {/* SUBTEXT */}
        <p className="text-gray-500 mb-6 md:mb-8 text-center animate-fade-in">
          Pesanan <span className="font-medium text-gray-900">#{order.id}</span>{' '}
          berhasil dibuat. Kami akan menghubungi Anda setelah pesanan siap
          dikirim.
        </p>

        {/* DETAIL BOX */}
        <div
          className="space-y-4 sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 
                        animate-fade-in"
        >
          <dl className="sm:flex items-center justify-between gap-4">
            <dt className="text-gray-500">Tanggal</dt>
            <dd className="font-medium text-gray-900 sm:text-end">
              {formattedDate}
            </dd>
          </dl>

          <dl className="sm:flex items-center justify-between gap-4">
            <dt className="text-gray-500">Nama Penerima</dt>
            <dd className="font-medium text-gray-900 sm:text-end">
              {order.fullName}
            </dd>
          </dl>

          <dl className="sm:flex items-center justify-between gap-4">
            <dt className="text-gray-500">Alamat</dt>
            <dd className="font-medium text-gray-900 sm:text-end">
              {order.address}, {order.city}
            </dd>
          </dl>

          <dl className="sm:flex items-center justify-between gap-4">
            <dt className="text-gray-500">Telepon</dt>
            <dd className="font-medium text-gray-900 sm:text-end">
              {order.phone}
            </dd>
          </dl>

          <dl className="sm:flex items-center justify-between gap-4">
            <dt className="text-gray-500">Total Pembayaran</dt>
            <dd className="font-medium text-gray-900 sm:text-end">
              Rp {order.totalPrice.toLocaleString('id-ID')}
            </dd>
          </dl>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center space-x-4 mt-6 justify-center animate-fade-in">
          <Link
            href={`/orders`}
            className="text-white bg-[#7D1972] hover:bg-[#9E1E93]
                       font-medium rounded-lg text-sm px-5 py-2.5 transition"
          >
            Lihat Riwayat Pesanan
          </Link>

          <Link
            href="/items"
            className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg 
                       border border-gray-200 hover:bg-gray-100 hover:text-[#7D1972] transition"
          >
            Kembali Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}

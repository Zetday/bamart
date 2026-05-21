'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderDetailSkeleton from '@/components/skeleton/OrderDetailSkeleton';

interface OrderItem {
  id: number;
  quantity: number;
  subtotal: number;
  item: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

interface OrderDetail {
  id: number;
  orderDate: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string | null;
  totalPrice: number;
  status: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/order/detail?orderId=${orderId}`);
      const data = await res.json();
      setOrder(data.order);
    }
    load();
  }, [orderId]);

  if (!order) {
    return <OrderDetailSkeleton />;
  }

  const orderDate = new Date(order.orderDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subtotal = order.items.reduce((sum, i) => sum + i.subtotal, 0);
  const shippingCost = order.totalPrice - subtotal;

  return (
    <>
      <div className="pt-24 px-4 max-w-3xl mx-auto pb-12">
        <h2 className="text-2xl font-bold mb-3">Detail Pesanan #{order.id}</h2>
        <p className="text-gray-500 mb-6">Tanggal: {orderDate}</p>

        {/* ===========================
            ORDER INFO
        =========================== */}
        <div className="rounded-lg border bg-gray-50 p-6 space-y-4 mb-6">
          <Row label="Nama Penerima" value={order.fullName} />
          <Row label="Telepon" value={order.phone} />
          <Row label="Alamat" value={`${order.address}, ${order.city}`} />
          <Row label="Kode Pos" value={order.postalCode} />

          {order.notes && <Row label="Catatan" value={order.notes} />}

          <Row label="Status" value={order.status} bold />
        </div>

        {/* ===========================
            ITEMS
        =========================== */}
        <h3 className="text-lg font-semibold mb-3">Produk yang Dibeli</h3>

        <div className="space-y-4 mb-8">
          {order.items.map((ci) => (
            <div
              key={ci.id}
              className="flex items-center gap-4 rounded-lg border p-4 bg-white"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                {ci.item.imageUrl ? (
                  <img
                    src={ci.item.imageUrl}
                    alt={ci.item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">{ci.item.name}</p>
                <p className="text-sm text-gray-500">
                  {ci.quantity} × Rp {ci.item.price.toLocaleString('id-ID')}
                </p>
              </div>

              <p className="font-semibold text-gray-900">
                Rp {ci.subtotal.toLocaleString('id-ID')}
              </p>
            </div>
          ))}
        </div>

        {/* ===========================
            SUMMARY
        =========================== */}
        <div className="rounded-lg border bg-gray-50 p-6 space-y-2 mb-6">
          <Row
            label="Subtotal"
            value={`Rp ${subtotal.toLocaleString('id-ID')}`}
          />
          <Row
            label="Ongkir"
            value={
              shippingCost === 0
                ? 'Gratis'
                : `Rp ${shippingCost.toLocaleString('id-ID')}`
            }
          />

          <Row
            label="Total Pembayaran"
            value={`Rp ${order.totalPrice.toLocaleString('id-ID')}`}
            bold
          />
        </div>

        {/* BUTTONS */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <Link
            href="/orders"
            className="py-2.5 px-5 text-sm font-medium bg-white border border-gray-300 rounded-lg 
              hover:bg-gray-100 hover:text-[#7D1972]"
          >
            Kembali ke Riwayat
          </Link>

          <Link
            href="/items"
            className="text-white bg-[#7D1972] px-5 py-2.5 rounded-lg text-sm font-medium 
              hover:bg-[#9E1E93]"
          >
            Belanja Lagi
          </Link>
          {/* Tombol Lanjutkan Pembayaran jika status masih PENDING */}
          {order.status === 'PENDING' && (
            <Link
              href={`/payment?orderId=${order.id}`}
              className="text-white bg-green-600 px-5 py-2.5 rounded-lg text-sm font-medium 
                 hover:bg-green-700"
            >
              Lanjutkan Pembayaran
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

/* =============================
   Row komponen kecil
============================= */
function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <dl className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={`text-right ${
          bold ? 'font-bold text-gray-900' : 'text-gray-900'
        }`}
      >
        {value}
      </dd>
    </dl>
  );
}

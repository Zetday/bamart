'use client';

import { useState, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
import { ShoppingCart, Receipt, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderRow {
  id: number;
  buyer: string;
  buyerId: number;
  totalPrice: number;
  status: string;
  date: string;

  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

interface OrderItemDetail {
  id: number;
  quantity: number;
  subtotal: number;
  itemName?: string;
  item?: {
    id: number;
    name: string;
    price: number;
  };
}

interface OrderDetail {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  totalPrice: number;
  status: string;
  orderDate: string;
  items: OrderItemDetail[];
}

export default function OrdersSellerClient({ rows }: { rows: OrderRow[] }) {
  const [detailData, setDetailData] = useState<OrderDetail | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const doDetail = useCallback(async (row: OrderRow) => {
    setLoadingDetail(true);
    setOpenDetail(true);

    try {
      const res = await fetch(`/api/orders/${row.id}`);
      const envelope = await res.json();
      if (envelope.success && envelope.data) {
        setDetailData(envelope.data);
      } else {
        setDetailData(envelope);
      }
    } catch {
      toast.error('Gagal memuat detail order');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Masuk</h1>
        <p className="text-slate-500 text-sm mt-1">Pesanan yang masuk ke toko Anda</p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable<OrderRow>
          columns={[
            { key: 'buyer', label: 'Pembeli' },
            {
              key: 'totalPrice',
              label: 'Total Harga',
              format: (v) => (
                <span className="font-semibold text-green-600">
                  Rp {Number(v).toLocaleString('id-ID')}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              format: (value) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    value === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : value === 'PAID'
                      ? 'bg-blue-100 text-blue-700'
                      : value === 'SHIPPED'
                      ? 'bg-purple-100 text-purple-700'
                      : value === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {value}
                </span>
              ),
            },
            {
              key: 'date',
              label: 'Tanggal',
              format: (v) =>
                new Date(v).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
            },
          ]}
          showIndex
          data={rows}
          actions={(row) => (
            <div className="flex justify-center">
              <ActionButtons id={row.id} onDetail={() => doDetail(row)} />
            </div>
          )}
        />
      </div>

      {/* DETAIL MODAL */}
      <Modal open={openDetail} onClose={() => setOpenDetail(false)} size="xl">
        {loadingDetail ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : detailData ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#7D1972] flex items-center justify-center shrink-0">
                <Receipt className="text-white" size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Detail Order #{detailData.id}
                </h2>
                <p className="text-xs text-slate-500">Informasi pesanan</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    detailData.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : detailData.status === 'PAID'
                      ? 'bg-blue-100 text-blue-700'
                      : detailData.status === 'SHIPPED'
                      ? 'bg-purple-100 text-purple-700'
                      : detailData.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {detailData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(detailData.orderDate).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nama:</span>
                <span className="font-semibold">{detailData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telepon:</span>
                <span className="font-semibold">{detailData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alamat:</span>
                <span className="font-semibold text-right">
                  {detailData.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kota:</span>
                <span className="font-semibold">{detailData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kode Pos:</span>
                <span className="font-semibold">{detailData.postalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Catatan:</span>
                <span className="font-semibold">{detailData.notes || '-'}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Package size={20} />
                Daftar Barang
              </h3>

              <div className="space-y-3">
                {Array.isArray(detailData?.items) &&
                  detailData.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex justify-between items-center border-b pb-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {it.itemName || it.item?.name || 'Barang'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {it.quantity} × Rp{' '}
                          {(it.item?.price ?? (it.quantity > 0 ? it.subtotal / it.quantity : 0)).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        Rp {it.subtotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-[#7D1972] text-white p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total Pembayaran</span>
                <span className="text-xl font-bold">
                  Rp {detailData.totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';
import { ShoppingCart, Receipt, Package, Trash2 } from 'lucide-react';

/* TYPES */
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

export interface OrderRow {
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

interface BuyerOption {
  id: number;
  name: string;
}

export default function OrdersTableClient({
  rows,
  buyers,
}: {
  rows: OrderRow[];
  buyers: BuyerOption[];
}) {
  const [data, setData] = useState<OrderRow[]>(rows);
  const [selected, setSelected] = useState<OrderRow | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [detailData, setDetailData] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const doEdit = useCallback((row: OrderRow) => {
    setSelected(row);
    setOpenEdit(true);
  }, []);

  const doDelete = useCallback((row: OrderRow) => {
    setSelected(row);
    setOpenDelete(true);
  }, []);

  const doDetail = useCallback(async (row: OrderRow) => {
    setSelected(row);
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

  const updateOrder = async (order: OrderRow) => {
    const res = await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return toast.error('Gagal memperbarui order');

    setData((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    toast.success('Order berhasil diperbarui');
    setOpenEdit(false);
  };

  const deleteOrder = async () => {
    if (!selected) return;

    const res = await fetch(`/api/orders/${selected.id}`, {
      method: 'DELETE',
    });

    if (!res.ok) return toast.error('Gagal menghapus order');

    setData((prev) => prev.filter((o) => o.id !== selected.id));
    toast.success('Order berhasil dihapus');
    setOpenDelete(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Order</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola semua pesanan</p>
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
          data={data}
          actions={(row) => (
            <div className="flex justify-center">
              <ActionButtons
                id={row.id}
                onDetail={() => doDetail(row)}
                onEdit={() => doEdit(row)}
                onDelete={() => doDelete(row)}
              />
            </div>
          )}
        />
      </div>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)} size="md">
        {selected && (
          <OrderForm
            buyers={buyers}
            initial={selected}
            onCancel={() => setOpenEdit(false)}
            onSubmit={updateOrder}
          />
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)} size="sm">
        <div className="text-center p-2">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Trash2 className="text-red-500" size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Hapus Order #{selected?.id}?
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Yakin ingin menghapus order milik{' '}
            <span className="font-semibold text-slate-700">{selected?.buyer}</span>?
          </p>
          <div className="flex gap-3">
            <button
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setOpenDelete(false)}
            >
              Batal
            </button>
            <button
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors cursor-pointer"
              onClick={deleteOrder}
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>

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
                <span className="text-gray-600">Nama Lengkap:</span>
                <span className="font-semibold">{detailData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telepon:</span>
                <span className="font-semibold">{detailData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alamat:</span>
                <span className="font-semibold text-right max-w-xs">
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

/* -------------------------------------------------------
   ORDER FORM
------------------------------------------------------- */

function OrderForm({
  buyers,
  initial,
  onSubmit,
  onCancel,
}: {
  buyers: BuyerOption[];
  initial: OrderRow;
  onSubmit: (order: OrderRow) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<OrderRow>(initial);

  function field<K extends keyof OrderRow>(key: K, value: OrderRow[K]) {
    setForm({ ...form, [key]: value });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
        <div className="w-9 h-9 rounded-lg bg-[#7D1972]/10 flex items-center justify-center shrink-0">
          <ShoppingCart className="text-[#7D1972]" size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Edit Order</h2>
      </div>

      {/* BUYER */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Pembeli
        </label>
        <select
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all bg-white"
          value={form.buyerId}
          onChange={(e) => {
            const id = Number(e.target.value);
            field('buyerId', id);
            field('buyer', buyers.find((b) => b.id === id)?.name || '');
          }}
        >
          {buyers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* TOTAL PRICE */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Total Harga (Rp)
        </label>
        <input
          type="number"
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
          value={form.totalPrice}
          onChange={(e) => field('totalPrice', Number(e.target.value))}
          required
        />
      </div>

      {/* STATUS */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Status
        </label>
        <select
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all bg-white"
          value={form.status}
          onChange={(e) => field('status', e.target.value)}
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* FULL NAME */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Nama Lengkap
        </label>
        <input
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
          value={form.fullName}
          onChange={(e) => field('fullName', e.target.value)}
          required
        />
      </div>

      {/* PHONE */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Telepon
        </label>
        <input
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
          value={form.phone}
          onChange={(e) => field('phone', e.target.value)}
          required
        />
      </div>

      {/* ADDRESS */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Alamat
        </label>
        <textarea
          rows={2}
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400 resize-none"
          value={form.address}
          onChange={(e) => field('address', e.target.value)}
          required
        />
      </div>

      {/* CITY & POSTAL CODE */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Kota
          </label>
          <input
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
            value={form.city}
            onChange={(e) => field('city', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Kode Pos
          </label>
          <input
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
            value={form.postalCode}
            onChange={(e) => field('postalCode', e.target.value)}
            required
          />
        </div>
      </div>

      {/* NOTES */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Catatan
        </label>
        <textarea
          rows={1}
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400 resize-none"
          value={form.notes}
          onChange={(e) => field('notes', e.target.value)}
        />
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold bg-[#7D1972] hover:bg-[#6a1560] text-white rounded-lg transition-colors cursor-pointer"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}


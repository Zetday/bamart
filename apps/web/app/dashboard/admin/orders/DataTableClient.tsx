'use client';

import { useState, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';
import { ShoppingCart, Eye, Receipt, Package, Trash2 } from 'lucide-react';

/* TYPES */
interface OrderItemDetail {
  id: number;
  quantity: number;
  subtotal: number;
  item: {
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
      const data: OrderDetail = await res.json();
      setDetailData(data);
    } catch (error) {
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
    <div className="p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <ShoppingCart className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Daftar Order
          </h2>
          <p className="text-gray-600 text-sm">Manage all orders</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <DataTable<OrderRow>
          columns={[
            { key: 'id', label: 'ID' },
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
          data={data}
          actions={(row) => (
            <div className="flex justify-end">
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
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        {selected && (
          <OrderForm
            buyers={buyers}
            initial={selected}
            onSubmit={updateOrder}
          />
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Hapus Order #{selected?.id}?
          </h2>

          <p className="text-gray-600 mb-6">
            Yakin ingin menghapus order milik{' '}
            <b className="text-gray-800">{selected?.buyer}</b>?
          </p>

          <div className="flex justify-center gap-3">
            <button
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-all duration-300"
              onClick={() => setOpenDelete(false)}
            >
              Batal
            </button>

            <button
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
              onClick={deleteOrder}
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal open={openDetail} onClose={() => setOpenDetail(false)}>
        {loadingDetail ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : detailData ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Receipt className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Detail Order #{detailData.id}
                </h2>
                <p className="text-sm text-gray-600">Order information</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
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
                {detailData.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {it.item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {it.quantity} × Rp{' '}
                        {it.item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">
                      Rp {it.subtotal.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Pembayaran</span>
                <span className="text-2xl font-bold">
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
}: {
  buyers: BuyerOption[];
  initial: OrderRow;
  onSubmit: (order: OrderRow) => void;
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
      {/* HEADER (DIPADATKAN) */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <ShoppingCart className="text-white" size={18} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Edit Order</h2>
      </div>

      {/* BUYER */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Pembeli
        </label>
        <select
          className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
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
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Total Harga (Rp)
        </label>
        <input
          type="number"
          className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
          value={form.totalPrice}
          onChange={(e) => field('totalPrice', Number(e.target.value))}
        />
      </div>

      {/* STATUS */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Status
        </label>
        <select
          className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
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
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Nama Lengkap
        </label>
        <input
          className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
          value={form.fullName}
          onChange={(e) => field('fullName', e.target.value)}
        />
      </div>

      {/* PHONE */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Telepon
        </label>
        <input
          className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
          value={form.phone}
          onChange={(e) => field('phone', e.target.value)}
        />
      </div>

      {/* ADDRESS */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Alamat
        </label>
        <textarea
          rows={2}
          className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
          value={form.address}
          onChange={(e) => field('address', e.target.value)}
        />
      </div>

      {/* CITY & POSTAL CODE */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Kota
          </label>
          <input
            className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
            value={form.city}
            onChange={(e) => field('city', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Kode Pos
          </label>
          <input
            className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
            value={form.postalCode}
            onChange={(e) => field('postalCode', e.target.value)}
          />
        </div>
      </div>

      {/* NOTES */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Catatan
        </label>
        <textarea
          rows={1}
          className="w-full py-2 px-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none transition"
          value={form.notes}
          onChange={(e) => field('notes', e.target.value)}
        />
      </div>

      {/* SAVE BUTTON */}
      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white font-semibold hover:shadow-md transition">
        Simpan
      </button>
    </form>
  );
}

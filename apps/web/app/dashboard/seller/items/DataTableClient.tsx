'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Plus,
  Package,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

/* ----------------------- TYPES ----------------------- */

export interface ItemRow {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string | null;
  imageUrl?: string | null;
  seller: string;
  category?: string | null;
  categoryId?: number | null;
  userId?: number;
}

export interface ItemFormData {
  name: string;
  description?: string | null;
  price: number | '';
  stock: number | '';
  imageUrl?: string | null;
  userId: number;
  categoryId: number | null;
}

export interface ItemUpdateFormData extends ItemFormData {
  id: number;
}

export interface CategoryOption {
  id: number;
  name: string;
}

/* ---------------------------------------
        SIDE PANEL
---------------------------------------- */

function SidePanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-red-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
/* =============================================================
                    MAIN COMPONENT
============================================================= */

export default function SellerItemsTableClient({
  rows,
  sellerId,
  categories,
}: {
  rows: ItemRow[];
  sellerId: number;
  categories: CategoryOption[];
}) {
  const [data, setData] = useState<ItemRow[]>(rows);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<ItemRow | null>(null);

  /* ------------------ ACTION HANDLERS ------------------ */

  const doAdd = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const doEdit = (row: ItemRow) => {
    setSelected(row);
    setOpenForm(true);
  };

  const doDelete = (row: ItemRow) => {
    setSelected(row);
    setOpenDelete(true);
  };

  /* ---------------------- CRUD ---------------------- */

  const addItem = async (form: ItemFormData) => {
    const payload: ItemFormData = { ...form, userId: sellerId };

    const res = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return toast.error('Gagal menambah item');

    const envelope = await res.json();
    if (envelope.success && envelope.data) {
      setData((prev) => [...prev, envelope.data]);
      setOpenForm(false);
      toast.success('Item berhasil ditambahkan!');
    } else {
      toast.error(envelope.error || 'Gagal menambah item');
    }
  };

  const updateItem = async (form: ItemUpdateFormData) => {
    const res = await fetch(`/api/items/${form.id}`, {
      method: 'PUT',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return toast.error('Gagal mengubah item');

    const envelope = await res.json();
    if (envelope.success && envelope.data) {
      setData((prev) => prev.map((x) => (x.id === envelope.data.id ? envelope.data : x)));
      setOpenForm(false);
      toast.success('Item berhasil diperbarui!');
    } else {
      toast.error(envelope.error || 'Gagal mengubah item');
    }
  };

  const deleteItem = async () => {
    if (!selected) return;

    const res = await fetch(`/api/items/${selected.id}`, {
      method: 'DELETE',
    });

    if (!res.ok) return toast.error('Gagal menghapus item');

    setData((prev) => prev.filter((x) => x.id !== selected.id));
    setOpenDelete(false);

    toast.success('Item berhasil dihapus!');
  };

  /* ---------------------- RENDER ---------------------- */

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7D1972] to-[#b14fab] flex items-center justify-center shadow-lg">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7D1972] to-[#b14fab] bg-clip-text text-transparent">
              Item Saya
            </h2>
            <p className="text-gray-600 text-sm">Manage your products</p>
          </div>
        </div>

        <button
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-medium"
          onClick={doAdd}
        >
          <Plus size={20} />
          Tambah Item
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            {
              key: 'imageUrl',
              label: 'Gambar',
              format: (value) => (
                <img
                  src={(value as string) || '/placeholder.png'}
                  alt="Product"
                  className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  loading="lazy"
                />
              ),
            },
            { key: 'name', label: 'Nama' },
            {
              key: 'price',
              label: 'Harga',
              format: (v) => (
                <span className="font-semibold text-green-600">
                  Rp {Number(v).toLocaleString('id-ID')}
                </span>
              ),
            },
            {
              key: 'stock',
              label: 'Stok',
              format: (value) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    (value as number) > 10
                      ? 'bg-green-100 text-green-700'
                      : (value as number) > 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {value as number}
                </span>
              ),
            },
            { key: 'category', label: 'Kategori' },
          ]}
          data={data}
          actions={(row) => (
            <ActionButtons
              id={row.id}
              onEdit={() => doEdit(row)}
              onDelete={() => doDelete(row)}
            />
          )}
        />
      </div>

      {/* FORM MODAL */}
      <SidePanel
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={selected ? 'Edit Item' : 'Tambah Item'}
      >
        <div className="max-h-[90vh] overflow-y-auto p-2">
          <SellerItemForm
            sellerId={sellerId}
            categories={categories}
            initial={selected ?? undefined}
            onSubmit={(f) =>
              selected ? updateItem({ ...f, id: selected.id }) : addItem(f)
            }
          />
        </div>
      </SidePanel>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hapus Item?</h2>

          <p className="text-gray-600 mb-6">
            Yakin ingin menghapus{' '}
            <b className="text-gray-800">{selected?.name}</b>?
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
              onClick={deleteItem}
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* =============================================================
      FORM COMPONENT (OPTIMIZED)
============================================================= */

function SellerItemForm({
  initial,
  sellerId,
  categories,
  onSubmit,
}: {
  initial?: ItemRow;
  sellerId: number;
  categories: CategoryOption[];
  onSubmit: (data: ItemFormData) => void;
}) {
  const [form, setForm] = useState<ItemFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? '',
    stock: initial?.stock ?? '',
    imageUrl: initial?.imageUrl ?? '',
    userId: sellerId,
    categoryId: initial?.categoryId ?? null,
  });

  const [preview, setPreview] = useState<string>(initial?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);

  /* Image Upload - Optimized */
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    const fd = new FormData();
    fd.append('file', file);
    if (initial?.imageUrl) fd.append('oldImageUrl', initial.imageUrl);

    try {
      const res = await fetch('/api/items/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        imageUrl: data.url,
      }));
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      toast.error('Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSubmit({
      ...form,
      price: form.price === '' ? 0 : Number(form.price),
      stock: form.stock === '' ? 0 : Number(form.stock),
    });
  }

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3 mb-2 md:col-span-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7D1972] to-[#b14fab] flex items-center justify-center">
          <Package className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {initial ? 'Edit Item' : 'Tambah Item'}
        </h2>
      </div>

      {/* NAME */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Nama Item
        </label>
        <input
          className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="Nama produk"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      {/* PRICE */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Harga
        </label>
        <input
          type="number"
          min={0}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="0"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value === '' ? '' : Number(e.target.value),
            })
          }
          required
        />
      </div>

      {/* STOCK */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">Stok</label>
        <input
          type="number"
          min={0}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="0"
          value={form.stock}
          onChange={(e) =>
            setForm({
              ...form,
              stock: e.target.value === '' ? '' : Number(e.target.value),
            })
          }
          required
        />
      </div>

      {/* CATEGORY */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Kategori
        </label>
        <select
          className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          value={form.categoryId ?? ''}
          onChange={(e) =>
            setForm({
              ...form,
              categoryId: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">Tidak ada kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* DESCRIPTION */}
      <div className="flex flex-col md:col-span-2">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="Deskripsi produk"
          rows={3}
          value={form.description ?? ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {/* IMAGE UPLOAD */}
      <div className="md:col-span-2 flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Gambar Item
        </label>

        <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl flex flex-col items-center gap-4 bg-gray-50 hover:border-purple-500 transition-all duration-300">
          {preview ? (
            <img
              className="w-40 h-40 rounded-xl object-cover shadow-lg"
              src={preview}
              alt="Preview"
            />
          ) : (
            <div className="w-40 h-40 rounded-xl bg-gray-200 flex items-center justify-center">
              <ImageIcon className="text-gray-400" size={48} />
            </div>
          )}

          <button
            type="button"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            onClick={() => document.getElementById('sellerImgInput')?.click()}
            disabled={uploading}
          >
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Pilih Gambar'}
          </button>

          <input
            id="sellerImgInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white font-semibold md:col-span-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
        Simpan
      </button>
    </form>
  );
}

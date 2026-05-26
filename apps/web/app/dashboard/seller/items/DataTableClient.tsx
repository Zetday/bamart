'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Item Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola produk Anda</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7D1972] hover:bg-[#9c2292] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          onClick={doAdd}
        >
          <Plus size={16} />
          Tambah Item
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable
          columns={[
            {
              key: 'imageUrl',
              label: 'Gambar',
              format: (value) => (
                <NextImage
                  src={(value as string) || '/placeholder.png'}
                  alt="Product"
                  width={56}
                  height={56}
                  unoptimized
                  className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
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
          showIndex
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

      {/* FORM MODAL - Centered */}
      <Modal open={openForm} onClose={() => setOpenForm(false)} size="4xl">
        <div className="p-1">
          <SellerItemForm
            sellerId={sellerId}
            categories={categories}
            initial={selected ?? undefined}
            onCancel={() => setOpenForm(false)}
            onSubmit={(f) =>
              selected ? updateItem({ ...f, id: selected.id }) : addItem(f)
            }
          />
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)} size="sm">
        <div className="text-center p-2">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Trash2 className="text-red-500" size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Hapus Item?</h2>
          <p className="text-slate-500 text-sm mb-6">
            Yakin ingin menghapus{' '}
            <span className="font-semibold text-slate-700">{selected?.name}</span>?
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
              onClick={deleteItem}
            >
              Ya, Hapus
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
  onCancel,
}: {
  initial?: ItemRow;
  sellerId: number;
  categories: CategoryOption[];
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
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
    } catch {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-[#7D1972]/10 flex items-center justify-center shrink-0">
          <Package className="text-[#7D1972]" size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          {initial ? 'Edit Item' : 'Tambah Item'}
        </h2>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Form Fields */}
        <div className="space-y-4">
          {/* NAMA */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-600 mb-1.5">
              Nama Item
            </label>
            <input
              className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
              placeholder="Nama produk"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* HARGA */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 mb-1.5">
                Harga
              </label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
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

            {/* STOK */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 mb-1.5">Stok</label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
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
          </div>

          {/* KATEGORI */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-600 mb-1.5">
              Kategori
            </label>
            <select
              className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all bg-white"
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
        </div>

        {/* Right Column: Deskripsi & Gambar */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* DESKRIPSI */}
          <div className="flex flex-col flex-1">
            <label className="text-xs font-semibold text-slate-600 mb-1.5">
              Deskripsi
            </label>
            <textarea
              className="w-full flex-1 px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400 resize-none min-h-[120px]"
              placeholder="Deskripsi produk"
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* GAMBAR */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-600 mb-1.5">
              Gambar Item
            </label>
            <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl flex items-center gap-4 hover:border-[#7D1972]/50 transition-all duration-300 bg-slate-50/50">
              {preview ? (
                <NextImage
                  src={preview}
                  alt="Preview"
                  width={80}
                  height={80}
                  unoptimized
                  className="w-20 h-20 object-cover rounded-lg shadow-sm border border-slate-100 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                  <ImageIcon className="text-slate-400" size={24} />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => document.getElementById('sellerImgInput')?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer animate-none"
                >
                  <Upload size={14} />
                  {uploading ? 'Uploading...' : 'Pilih Gambar'}
                </button>
                <span className="text-[10px] text-slate-400">Format: JPG, PNG, WEBP (Maks. 2MB)</span>
              </div>

              <input
                id="sellerImgInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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


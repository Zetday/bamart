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
    <div className="flex-1 bg-slate-50 min-h-screen p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Item Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola produk Anda</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7D1972] hover:bg-[#9c2292] text-white text-sm font-medium rounded-lg transition-colors"
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
      <Modal open={openForm} onClose={() => setOpenForm(false)}>
        <div className="max-h-[85vh] overflow-y-auto p-3">
          <SellerItemForm
            sellerId={sellerId}
            categories={categories}
            initial={selected ?? undefined}
            onSubmit={(f) =>
              selected ? updateItem({ ...f, id: selected.id }) : addItem(f)
            }
          />
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <div className="text-center p-6">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-red-500" size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Hapus Item?</h2>
          <p className="text-slate-500 text-sm mb-6">
            Yakin ingin menghapus{' '}
            <span className="font-semibold text-slate-700">{selected?.name}</span>?
          </p>
          <div className="flex justify-center gap-3">
            <button
              className="px-5 py-2.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              onClick={() => setOpenDelete(false)}
            >
              Batal
            </button>
            <button
              className="px-5 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3 mb-2 md:col-span-2">
        <div className="w-9 h-9 rounded-lg bg-[#7D1972] flex items-center justify-center shrink-0">
          <Package className="text-white" size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
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
            <NextImage
              className="w-40 h-40 rounded-xl object-cover shadow-lg"
              src={preview}
              alt="Preview"
              width={160}
              height={160}
              unoptimized
            />
          ) : (
            <div className="w-40 h-40 rounded-xl bg-gray-200 flex items-center justify-center">
              <ImageIcon className="text-gray-400" size={48} />
            </div>
          )}

          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#7D1972] hover:bg-[#9c2292] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
      <button className="w-full py-3 rounded-lg bg-[#7D1972] hover:bg-[#9c2292] text-white font-semibold md:col-span-2 transition-colors">
        Simpan
      </button>
    </form>
  );
}

'use client';

import { useState, useMemo } from 'react';
import NextImage from 'next/image';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';
import { Plus, Package, Upload, Image as ImageIcon } from 'lucide-react';

/* ---------------------------------------
        TYPES
---------------------------------------- */

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

export interface ItemFormInput {
  userId: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  categoryId?: number | null;
}

export interface ItemUpdateInput extends ItemFormInput {
  id: number;
}

export interface UserOption {
  id: number;
  name: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
}

export interface CategoryOption {
  id: number;
  name: string;
}

/* ---------------------------------------
        MAIN COMPONENT
---------------------------------------- */

export default function ItemsTableClient({
  rows,
  users,
  categories,
}: {
  rows: ItemRow[];
  users: UserOption[];
  categories: CategoryOption[];
}) {
  const [data, setData] = useState(rows);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<ItemRow | null>(null);

  const sellerUsers = useMemo(
    () => users.filter((u) => u.role === 'SELLER'),
    [users]
  );

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

  /* CRUD */
  const addItem = async (item: ItemFormInput) => {
    const res = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(item),
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

  const updateItem = async (item: ItemUpdateInput) => {
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
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

    const res = await fetch(`/api/items/${selected.id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Gagal menghapus item');

    setData((prev) => prev.filter((x) => x.id !== selected.id));
    setOpenDelete(false);
    toast.success('Item berhasil dihapus!');
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Item</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola semua produk</p>
        </div>
        <button
          onClick={doAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7D1972] hover:bg-[#9c2292] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Tambah Item
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable
          columns={[
            { key: 'imageUrl', label: 'Gambar',
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
            { key: 'name', label: 'Nama Item' },
            {
              key: 'price',
              label: 'Harga',
              format: (value) => (
                <span className="font-semibold text-green-600">
                  Rp {(value as number).toLocaleString('id-ID')}
                </span>
              ),
            },
            { key: 'stock', label: 'Stok' },
            { key: 'category', label: 'Kategori' },
            { key: 'seller', label: 'Penjual' },
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
          <ItemForm
            initial={selected ?? undefined}
            users={sellerUsers}
            categories={categories}
            onSubmit={(formData) =>
              selected
                ? updateItem({ ...formData, id: selected.id })
                : addItem(formData)
            }
          />
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <div className="text-center p-6">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Package className="text-red-500" size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Hapus Item?</h2>
          <p className="text-slate-500 text-sm mb-6">
            Yakin ingin menghapus <span className="font-semibold text-slate-700">{selected?.name}</span>?
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

/* ---------------------------------------
      ITEM FORM (FULL – TIDAK DIUBAH)
---------------------------------------- */

function ItemForm({
  initial,
  onSubmit,
  users,
  categories,
}: {
  initial?: ItemRow;
  onSubmit: (data: ItemFormInput | ItemUpdateInput) => void;
  users: UserOption[];
  categories: CategoryOption[];
}) {
  const [form, setForm] = useState<ItemFormInput>({
    userId: initial?.userId ?? users[0]?.id ?? 0,
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial ? initial.price : ('' as unknown as number),
    stock: initial ? initial.stock : ('' as unknown as number),
    imageUrl: initial?.imageUrl ?? '',
    categoryId: initial?.categoryId ?? null,
  });

  const [preview, setPreview] = useState<string>(initial?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    if (initial?.imageUrl) formData.append('oldImageUrl', initial.imageUrl);

    try {
      const res = await fetch('/api/items/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error('Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (initial) {
      onSubmit({ ...form, id: initial.id });
    } else {
      onSubmit(form);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      <div className="flex items-center gap-3 mb-2 md:col-span-2">
        <div className="w-9 h-9 rounded-lg bg-[#7D1972] flex items-center justify-center shrink-0">
          <Package className="text-white" size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          {initial ? 'Edit Item' : 'Tambah Item'}
        </h2>
      </div>

      {/* NAMA */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Nama Item
        </label>
        <input
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="Nama produk"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      {/* HARGA */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Harga
        </label>
        <input
          type="number"
          min={0}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="0"
          value={form.price === null ? '' : form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price:
                e.target.value === ''
                  ? ('' as unknown as number)
                  : Number(e.target.value),
            })
          }
        />
      </div>

      {/* STOK */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">Stok</label>
        <input
          type="number"
          min={0}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="0"
          value={form.stock === null ? '' : form.stock}
          onChange={(e) =>
            setForm({
              ...form,
              stock:
                e.target.value === ''
                  ? ('' as unknown as number)
                  : Number(e.target.value),
            })
          }
        />
      </div>

      {/* SELLER */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Penjual
        </label>
        <select
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* KATEGORI */}
      <div className="flex flex-col md:col-span-2">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Kategori
        </label>
        <select
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
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

      {/* DESKRIPSI */}
      <div className="md:col-span-2 flex flex-col">
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

      {/* GAMBAR */}
      <div className="md:col-span-2 flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-2">
          Gambar Item
        </label>

        <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl flex flex-col items-center gap-4 hover:border-purple-500 transition-all duration-300 bg-gray-50">
          {preview ? (
            <NextImage
              src={preview}
              alt="Preview"
              width={160}
              height={160}
              unoptimized
              className="w-40 h-40 object-cover rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-40 h-40 rounded-xl bg-gray-200 flex items-center justify-center">
              <ImageIcon className="text-gray-400" size={48} />
            </div>
          )}

          <button
            type="button"
            onClick={() => document.getElementById('imageInput')?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#7D1972] hover:bg-[#9c2292] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Pilih Gambar'}
          </button>

          <input
            id="imageInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <button className="md:col-span-2 py-3 rounded-lg bg-[#7D1972] hover:bg-[#9c2292] text-white font-semibold transition-colors">
        Simpan
      </button>
    </form>
  );
}

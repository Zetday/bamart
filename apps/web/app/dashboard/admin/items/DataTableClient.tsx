'use client';

import { useState, useMemo } from 'react';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';
import { Plus, Package, Upload, Image as ImageIcon, X } from 'lucide-react';

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

    const newItem = await res.json();
    setData((prev) => [...prev, newItem]);
    setOpenForm(false);
    toast.success('Item berhasil ditambahkan!');
  };

  const updateItem = async (item: ItemUpdateInput) => {
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return toast.error('Gagal mengubah item');

    const updated = await res.json();
    setData((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    setOpenForm(false);
    toast.success('Item berhasil diperbarui!');
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
    <div className="p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7D1972] to-[#b14fab] flex items-center justify-center shadow-lg">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7D1972] to-[#b14fab] bg-clip-text text-transparent">
              Daftar Item
            </h2>
            <p className="text-gray-600 text-sm">Manage all products</p>
          </div>
        </div>

        <button
          onClick={doAdd}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white hover:shadow-lg hover:scale-105 transition-all"
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

      {/* SIDE PANEL FORM */}
      <SidePanel
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={selected ? 'Edit Item' : 'Tambah Item'}
      >
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
      </SidePanel>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">Hapus Item?</h2>
          <p className="mb-6">
            Yakin ingin menghapus <b>{selected?.name}</b>?
          </p>
          <div className="flex justify-center gap-3">
            <button
              className="px-6 py-2 bg-gray-200 rounded-xl"
              onClick={() => setOpenDelete(false)}
            >
              Batal
            </button>
            <button
              className="px-6 py-2 bg-red-600 text-white rounded-xl"
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
    initial ? onSubmit({ ...form, id: initial.id }) : onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      <div className="flex items-center gap-3 mb-2 md:col-span-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7D1972] to-[#b14fab] flex items-center justify-center">
          <Package className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
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
            <img
              src={preview}
              alt="Preview"
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
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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
      <button className="md:col-span-2 py-3 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white font-semibold">
        Simpan
      </button>
    </form>
  );
}

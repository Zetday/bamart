'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import ActionButtons from '@/components/ActionButtons';
import toast from 'react-hot-toast';
import DataTable from '@/components/DataTable';
import { Plus, Tag } from 'lucide-react';

/* ---------------------- TYPES ---------------------- */

export interface CategoryRow {
  id: number;
  name: string;
  description?: string | null;
}

interface CategoryFormData {
  name: string;
  description?: string | null;
}

/* =============================================================
                        MAIN COMPONENT
============================================================= */

export default function DataTableClient({ rows }: { rows: CategoryRow[] }) {
  const [data, setData] = useState<CategoryRow[]>(rows);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<CategoryRow | null>(null);

  /* ---------------- ACTIONS ---------------- */

  const doAdd = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const doEdit = (row: CategoryRow) => {
    setSelected(row);
    setOpenForm(true);
  };

  const doDelete = (row: CategoryRow) => {
    setSelected(row);
    setOpenDelete(true);
  };

  /* ---------------- CRUD ---------------- */

  const addCategory = async (form: CategoryFormData) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return toast.error('Gagal menambah kategori');

    const envelope = await res.json();
    if (envelope.success && envelope.data) {
      setData((prev) => [...prev, envelope.data]);
      setOpenForm(false);
      toast.success('Kategori berhasil ditambahkan!');
    } else {
      toast.error(envelope.error || 'Gagal menambah kategori');
    }
  };

  const updateCategory = async (form: CategoryRow) => {
    const res = await fetch(`/api/categories/${form.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: form.name,
        description: form.description,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return toast.error('Gagal mengubah kategori');

    const envelope = await res.json();
    if (envelope.success && envelope.data) {
      setData((prev) => prev.map((x) => (x.id === envelope.data.id ? envelope.data : x)));
      setOpenForm(false);
      toast.success('Kategori berhasil diperbarui!');
    } else {
      toast.error(envelope.error || 'Gagal mengubah kategori');
    }
  };

  const deleteCategory = async () => {
    if (!selected) return;

    const res = await fetch(`/api/categories/${selected.id}`, {
      method: 'DELETE',
    });

    if (!res.ok)
      return toast.error('Gagal menghapus kategori (mungkin digunakan item)');

    setData((prev) => prev.filter((x) => x.id !== selected.id));
    setOpenDelete(false);

    toast.success('Kategori berhasil dihapus!');
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Kategori</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola kategori produk</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7D1972] hover:bg-[#9c2292] text-white text-sm font-medium rounded-lg transition-colors"
          onClick={doAdd}
        >
          <Plus size={16} />
          Tambah Kategori
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable
          columns={[
            { key: 'name', label: 'Nama Kategori' },
            { key: 'description', label: 'Deskripsi' },
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

      {/* FORM MODAL */}
      <Modal open={openForm} onClose={() => setOpenForm(false)}>
        <div className="max-h-[85vh] overflow-y-auto p-3">
          <CategoryForm
            initial={selected ?? undefined}
            onSubmit={(form) =>
              selected
                ? updateCategory({
                    id: selected.id,
                    name: form.name,
                    description: form.description,
                  })
                : addCategory(form)
            }
          />
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Tag className="text-red-500" size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Hapus Kategori?
          </h2>
          <p className="text-slate-500 text-sm mb-1">
            Yakin ingin menghapus <span className="font-semibold text-slate-700">{selected?.name}</span>?
          </p>
          <p className="text-xs text-red-500 mb-6">Kategori yang digunakan item tidak dapat dihapus.</p>

          <div className="flex justify-center gap-3">
            <button
              className="px-5 py-2.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              onClick={() => setOpenDelete(false)}
            >
              Batal
            </button>

            <button
              className="px-5 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              onClick={deleteCategory}
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
                      FORM COMPONENT
============================================================= */

function CategoryForm({
  initial,
  onSubmit,
}: {
  initial?: CategoryRow;
  onSubmit: (data: CategoryFormData) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, description });
  }

  return (
    <form
      className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-[#7D1972] flex items-center justify-center shrink-0">
          <Tag className="text-white" size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          {initial ? 'Edit Kategori' : 'Tambah Kategori'}
        </h2>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nama Kategori
        </label>
        <input
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="Masukkan nama kategori"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="Masukkan deskripsi kategori (opsional)"
          rows={4}
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button className="py-3 rounded-lg bg-[#7D1972] hover:bg-[#9c2292] text-white font-semibold transition-colors">
        Simpan
      </button>
    </form>
  );
}

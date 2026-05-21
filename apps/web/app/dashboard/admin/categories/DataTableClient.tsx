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

    const newCategory: CategoryRow = await res.json();

    setData((prev) => [...prev, newCategory]);
    setOpenForm(false);

    toast.success('Kategori berhasil ditambahkan!');
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

    const updated: CategoryRow = await res.json();

    setData((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));

    setOpenForm(false);
    toast.success('Kategori berhasil diperbarui!');
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
    <div className="p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7D1972] to-[#b14fab] flex items-center justify-center shadow-lg">
            <Tag className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#7D1972] to-[#b14fab] bg-clip-text text-transparent">
              Kelola Kategori
            </h2>
            <p className="text-gray-600 text-sm">Manage product categories</p>
          </div>
        </div>

        <button
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-medium"
          onClick={doAdd}
        >
          <Plus size={20} />
          Tambah Kategori
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nama Kategori' },
            { key: 'description', label: 'Deskripsi' },
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
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Tag className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Hapus Kategori?
          </h2>
          <p className="text-gray-600 mb-6">
            Yakin ingin menghapus kategori{' '}
            <b className="text-gray-800">{selected?.name}</b>?
            <br />
            <span className="text-sm text-red-600">
              Kategori yang digunakan item tidak dapat dihapus
            </span>
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
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7D1972] to-[#b14fab] flex items-center justify-center">
          <Tag className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
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

      <button className="py-3 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
        Simpan
      </button>
    </form>
  );
}

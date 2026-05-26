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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Kategori</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola kategori produk</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7D1972] hover:bg-[#9c2292] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
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
      <Modal open={openForm} onClose={() => setOpenForm(false)} size="md">
        <CategoryForm
          initial={selected ?? undefined}
          onCancel={() => setOpenForm(false)}
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
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)} size="sm">
        <div className="text-center p-2">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Tag className="text-red-500" size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Hapus Kategori?
          </h2>
          <p className="text-slate-500 text-sm mb-1">
            Yakin ingin menghapus <span className="font-semibold text-slate-700">{selected?.name}</span>?
          </p>
          <p className="text-xs text-red-500 mb-6">Kategori yang digunakan item tidak dapat dihapus.</p>

          <div className="flex gap-3">
            <button
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setOpenDelete(false)}
            >
              Batal
            </button>
            <button
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors cursor-pointer"
              onClick={deleteCategory}
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
                      FORM COMPONENT
============================================================= */

function CategoryForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: CategoryRow;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, description });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
        <div className="w-9 h-9 rounded-lg bg-[#7D1972]/10 flex items-center justify-center shrink-0">
          <Tag className="text-[#7D1972]" size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          {initial ? 'Edit Kategori' : 'Tambah Kategori'}
        </h2>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Nama Kategori
        </label>
        <input
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
          placeholder="Masukkan nama kategori"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Deskripsi
        </label>
        <textarea
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400 resize-none"
          placeholder="Masukkan deskripsi kategori (opsional)"
          rows={4}
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

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


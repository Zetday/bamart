'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
import { Plus, Trash2, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-violet-100 text-violet-700 border border-violet-200',
  SELLER: 'bg-sky-100 text-sky-700 border border-sky-200',
  BUYER: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export default function DataTableClient({ rows }: { rows: UserRow[] }) {
  const [data, setData] = useState(rows);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);

  const doAdd = () => { setSelected(null); setOpenForm(true); };
  const doEdit = (row: UserRow) => { setSelected(row); setOpenForm(true); };
  const doDelete = (row: UserRow) => { setSelected(row); setOpenDelete(true); };

  const addUser = async (u: UserRow) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: u.name, email: u.email, role: u.role }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return toast.error('Gagal menambah user');
    const envelope = await res.json();
    if (envelope.success && envelope.data) {
      setData((prev) => [...prev, envelope.data]);
      setOpenForm(false);
      toast.success('User berhasil ditambahkan!');
    } else {
      toast.error(envelope.error || 'Gagal menambah user');
    }
  };

  const updateUser = async (u: UserRow) => {
    const res = await fetch(`/api/users/${u.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: u.name, email: u.email, role: u.role }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return toast.error('Gagal mengubah user');
    const envelope = await res.json();
    if (envelope.success && envelope.data) {
      setData((prev) => prev.map((x) => (x.id === envelope.data.id ? envelope.data : x)));
      setOpenForm(false);
      toast.success('User berhasil diperbarui!');
    } else {
      toast.error(envelope.error || 'Gagal mengubah user');
    }
  };

  const deleteUser = async () => {
    if (!selected) return;
    const res = await fetch(`/api/users/${selected.id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error('Gagal menghapus user');
    const envelope = await res.json();
    if (envelope.success) {
      setData((prev) => prev.filter((x) => x.id !== selected.id));
      setOpenDelete(false);
      toast.success('User berhasil dihapus!');
    } else {
      toast.error(envelope.error || 'Gagal menghapus user');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar User</h1>
          <p className="text-slate-500 text-sm mt-1">{data.length} pengguna terdaftar</p>
        </div>
        <button
          onClick={doAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#7D1972] hover:bg-[#9c2292] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable
          columns={[
            { key: 'name', label: 'Nama' },
            { key: 'email', label: 'Email' },
            {
              key: 'role',
              label: 'Role',
              format: (value) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLES[value as string] ?? ROLE_STYLES.BUYER}`}>
                  {value}
                </span>
              ),
            },
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
        <UserForm
          initial={selected ?? undefined}
          onCancel={() => setOpenForm(false)}
          onSubmit={(form) => (selected ? updateUser(form) : addUser(form))}
        />
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)} size="sm">
        <div className="text-center p-2">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Hapus User?</h2>
          <p className="text-sm text-slate-500 mb-6">
            Aksi ini akan menghapus{' '}
            <span className="font-semibold text-slate-700">{selected?.name}</span>{' '}
            secara permanen.
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
              onClick={deleteUser}
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── FORM ─────────────────────────────────────────────── */

function UserForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: UserRow;
  onSubmit: (u: UserRow) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(() => ({
    id: initial?.id ?? 0,
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    role: initial?.role ?? 'BUYER',
  }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
    >
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
        <div className="w-9 h-9 rounded-lg bg-[#7D1972]/10 flex items-center justify-center shrink-0">
          <UserCircle size={20} className="text-[#7D1972]" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          {initial ? 'Edit User' : 'Tambah User'}
        </h2>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama</label>
        <input
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
          placeholder="Nama pengguna"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all placeholder-slate-400"
          placeholder="user@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
        <select
          className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all bg-white"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="BUYER">BUYER</option>
          <option value="SELLER">SELLER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
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


'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import ActionButtons from '@/components/ActionButtons';
import Modal from '@/components/Modal';
import { Plus, Users, Trash2, UserCircle } from 'lucide-react';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function DataTableClient({ rows }: { rows: UserRow[] }) {
  const [data, setData] = useState(rows);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);

  const doAdd = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const doEdit = (row: UserRow) => {
    setSelected(row);
    setOpenForm(true);
  };

  const doDelete = (row: UserRow) => {
    setSelected(row);
    setOpenDelete(true);
  };

  const addUser = (u: UserRow) => {
    setData((prev) => [...prev, u]);
    setOpenForm(false);
  };

  const updateUser = (u: UserRow) => {
    setData((prev) => prev.map((x) => (x.id === u.id ? u : x)));
    setOpenForm(false);
  };

  const deleteUser = () => {
    if (selected) setData((prev) => prev.filter((x) => x.id !== selected.id));
    setOpenDelete(false);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Daftar User
            </h2>
            <p className="text-gray-600 text-sm">Manage system users</p>
          </div>
        </div>

        <button
          onClick={doAdd}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-medium"
        >
          <Plus size={20} />
          Tambah User
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Nama' },
            { key: 'email', label: 'Email' },
            {
              key: 'role',
              label: 'Role',
              format: (value) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    value === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : value === 'SELLER'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {value}
                </span>
              ),
            },
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
        <UserForm
          initial={selected ?? undefined}
          onSubmit={(form) => (selected ? updateUser(form) : addUser(form))}
        />
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={openDelete} onClose={() => setOpenDelete(false)}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hapus User?</h2>
          <p className="text-gray-600 mb-6">
            Yakin ingin menghapus user{' '}
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
              onClick={deleteUser}
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function UserForm({
  initial,
  onSubmit,
}: {
  initial?: UserRow;
  onSubmit: (u: UserRow) => void;
}) {
  const [form, setForm] = useState(() => ({
    id: initial?.id ?? Date.now(),
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    role: initial?.role ?? 'BUYER',
  }));

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <UserCircle className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {initial ? 'Edit User' : 'Tambah User'}
        </h2>
      </div>

      {/* NAMA */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nama
        </label>
        <input
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="Masukkan nama pengguna"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      {/* EMAIL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email
        </label>
        <input
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          placeholder="Masukkan email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      {/* ROLE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Role
        </label>
        <select
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 outline-none"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="BUYER">BUYER</option>
          <option value="SELLER">SELLER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
        Simpan
      </button>
    </form>
  );
}

'use client';

import { Eye, Edit2, Trash2 } from 'lucide-react';

interface Props {
  id: number;
  onDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ActionButtons({ onDetail, onEdit, onDelete }: Props) {
  return (
    <div className="flex gap-2 justify-end">
      {onDetail && (
        <button
          onClick={onDetail}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-sm transition-all cursor-pointer"
          title="Lihat Detail"
        >
          <Eye size={13} />
          <span>Detail</span>
        </button>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-100 hover:bg-sky-100 hover:text-sky-800 rounded-lg transition-all cursor-pointer"
          title="Edit Data"
        >
          <Edit2 size={13} />
          <span>Edit</span>
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 hover:text-red-800 rounded-lg transition-all cursor-pointer"
          title="Hapus Data"
        >
          <Trash2 size={13} />
          <span>Hapus</span>
        </button>
      )}
    </div>
  );
}


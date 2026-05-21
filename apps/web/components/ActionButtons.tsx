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
          className="group relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white border-2 border-transparent hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
          title="Lihat Detail"
        >
          <Eye
            size={14}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          <span>Detail</span>
        </button>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="group relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-transparent hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
          title="Edit Data"
        >
          <Edit2
            size={14}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          <span>Edit</span>
        </button>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="group relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-transparent hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
          title="Hapus Data"
        >
          <Trash2
            size={14}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          <span>Hapus</span>
        </button>
      )}
    </div>
  );
}

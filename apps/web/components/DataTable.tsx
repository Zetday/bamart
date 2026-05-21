'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export interface DataColumn<T, K extends keyof T = keyof T> {
  key: K;
  label: string;
  format?: (value: T[K], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    null
  );

  // SORT HANDLER
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') setSortDirection(null);
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // FILTER
  const filtered = data.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  );

  // SORT
  const sorted = [...filtered].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    const x = a[sortField];
    const y = b[sortField];

    if (typeof x === 'number' && typeof y === 'number') {
      return sortDirection === 'asc' ? x - y : y - x;
    }

    return sortDirection === 'asc'
      ? String(x).localeCompare(String(y))
      : String(y).localeCompare(String(x));
  });

  // PAGINATION
  const total = sorted.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = sorted.slice(start, end);

  return (
    <div className="space-y-4">
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center flex-wrap gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-t-2xl border-b border-gray-200">
        {/* TAMPILKAN X DATA */}
        <div className="flex items-center gap-3 text-gray-700">
          <span className="font-medium">Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border-2 border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 font-medium"
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num}>{num}</option>
            ))}
          </select>
          <span className="font-medium">data</span>
        </div>

        {/* SEARCH BAR MODERN */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari data..."
            className="pl-12 pr-6 py-2.5 bg-white border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 outline-none w-64 font-medium text-gray-700 placeholder:text-gray-400"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-700 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
              {columns.map((col) => {
                const isSorted = sortField === col.key;
                const icon =
                  isSorted && sortDirection === 'asc' ? (
                    <ChevronUp size={16} className="text-purple-600" />
                  ) : isSorted && sortDirection === 'desc' ? (
                    <ChevronDown size={16} className="text-purple-600" />
                  ) : (
                    <div className="w-4 h-4 opacity-0">
                      <ChevronUp size={16} />
                    </div>
                  );

                return (
                  <th
                    key={String(col.key)}
                    onClick={() => handleSort(col.key)}
                    className="p-4 cursor-pointer hover:text-purple-600 transition-all duration-300 font-bold text-left uppercase tracking-wide text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {icon}
                    </div>
                  </th>
                );
              })}

              {actions && (
                <th className="p-4 text-center font-bold uppercase tracking-wide text-xs">
                  Aksi
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all duration-300"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="p-4 text-gray-700">
                    {col.format
                      ? col.format(row[col.key], row)
                      : String(row[col.key])}
                  </td>
                ))}

                {actions && <td className="p-4 text-center">{actions(row)}</td>}
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="p-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="text-gray-400" size={32} />
                    </div>
                    <p className="text-lg font-medium">
                      Tidak ada data ditemukan
                    </p>
                    <p className="text-sm text-gray-400">
                      Coba ubah filter atau kata kunci pencarian
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center text-sm text-gray-600 px-6 py-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-b-2xl border-t border-gray-200">
        {/* INFO */}
        <p className="font-medium">
          Menampilkan{' '}
          <span className="text-purple-600 font-bold">
            {start + 1}-{Math.min(end, total)}
          </span>{' '}
          dari <span className="text-purple-600 font-bold">{total}</span> data
        </p>

        {/* PAGINATION MODERN */}
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:bg-white hover:border-purple-500 hover:text-purple-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all duration-300 font-medium"
          >
            Prev
          </button>

          {/* Page Numbers - Smart Display */}
          {(() => {
            const maxVisible = 5;
            const pages: (number | string)[] = [];

            if (totalPages <= maxVisible) {
              // Show all pages
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              // Smart pagination
              if (page <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
              } else if (page >= totalPages - 2) {
                pages.push(
                  1,
                  '...',
                  totalPages - 3,
                  totalPages - 2,
                  totalPages - 1,
                  totalPages
                );
              } else {
                pages.push(
                  1,
                  '...',
                  page - 1,
                  page,
                  page + 1,
                  '...',
                  totalPages
                );
              }
            }

            return pages.map((p, i) =>
              typeof p === 'number' ? (
                <button
                  key={i}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 ${
                    page === p
                      ? 'bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white border-transparent shadow-lg shadow-purple-500/30'
                      : 'border-gray-200 hover:bg-white hover:border-purple-500 hover:text-purple-600'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={i} className="px-2 text-gray-400">
                  {p}
                </span>
              )
            );
          })()}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:bg-white hover:border-purple-500 hover:text-purple-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all duration-300 font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

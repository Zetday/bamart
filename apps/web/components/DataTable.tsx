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
  showIndex?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  actions,
  showIndex = false,
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
      <div className="flex justify-between items-center flex-wrap gap-4 px-6 py-4 bg-slate-50/75 rounded-t-2xl border-b border-slate-100">
        {/* TAMPILKAN X DATA */}
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-[#7D1972] focus:ring-2 focus:ring-[#7D1972]/10 transition-all text-sm font-semibold text-slate-700 shadow-xs cursor-pointer"
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num}>{num}</option>
            ))}
          </select>
          <span>data</span>
        </div>

        {/* SEARCH BAR MODERN */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari data..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7D1972]/10 focus:border-[#7D1972] transition-all outline-none w-64 text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-xs"
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
            <tr className="text-slate-600 border-b border-slate-200 bg-slate-50/50">
              {showIndex && (
                <th className="px-6 py-4 font-bold text-left uppercase tracking-wider text-[11px] w-14">
                  No.
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortField === col.key;
                const icon =
                  isSorted && sortDirection === 'asc' ? (
                    <ChevronUp size={14} className="text-[#7D1972]" />
                  ) : isSorted && sortDirection === 'desc' ? (
                    <ChevronDown size={14} className="text-[#7D1972]" />
                  ) : (
                    <div className="w-3.5 h-3.5 opacity-0">
                      <ChevronUp size={14} />
                    </div>
                  );

                return (
                  <th
                    key={String(col.key)}
                    onClick={() => handleSort(col.key)}
                    className="px-6 py-4 cursor-pointer hover:text-[#7D1972] transition-colors font-bold text-left uppercase tracking-wider text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {icon}
                    </div>
                  </th>
                );
              })}

              {actions && (
                <th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-[11px]">
                  Aksi
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors duration-150"
              >
                {showIndex && (
                  <td className="px-6 py-4 text-slate-500 font-medium text-sm w-14">
                    {start + i + 1}
                  </td>
                )}
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4 text-slate-700 font-medium">
                    {col.format
                      ? col.format(row[col.key], row)
                      : String(row[col.key])}
                  </td>
                ))}

                {actions && <td className="px-6 py-4 text-center">{actions(row)}</td>}
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0) + (showIndex ? 1 : 0)}
                  className="p-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <Search className="text-slate-400" size={24} />
                    </div>
                    <p className="text-base font-semibold text-slate-700">
                      Tidak ada data ditemukan
                    </p>
                    <p className="text-xs text-slate-400">
                      Coba ubah kata kunci pencarian
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center text-sm text-slate-500 px-6 py-4 bg-slate-50/75 rounded-b-2xl border-t border-slate-100">
        {/* INFO */}
        <p className="font-medium text-slate-500">
          Menampilkan{' '}
          <span className="text-[#7D1972] font-semibold">
            {start + 1}-{Math.min(end, total)}
          </span>{' '}
          dari <span className="text-[#7D1972] font-semibold">{total}</span> data
        </p>

        {/* PAGINATION MODERN */}
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-all text-sm font-semibold shadow-xs cursor-pointer"
          >
            Prev
          </button>

          {/* Page Numbers */}
          {(() => {
            const maxVisible = 5;
            const pages: (number | string)[] = [];

            if (totalPages <= maxVisible) {
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
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
                  className={`px-3.5 py-2 rounded-xl border font-semibold transition-all text-sm shadow-xs ${
                    page === p
                      ? 'bg-[#7D1972] text-white border-transparent shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={i} className="px-2 text-slate-400">
                  {p}
                </span>
              )
            );
          })()}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-all text-sm font-semibold shadow-xs cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

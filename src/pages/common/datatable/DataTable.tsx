"use client";

import React, { useEffect, useState, useCallback, JSX } from "react";
import Loader from "@/ui/common/loader/Loader";
import { FaDownload } from "react-icons/fa";
import LoaderInner from "../loader/LoaderInner";

type SortOrder = "ASC" | "DESC";

interface DataTableProps<T> {
  title: string;
  columns: {
    label: string;
    sortKey?: string;
    width?: number | string;
    render?: (row: T) => React.ReactNode;
  }[];
  fetchData: (
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    sortOrder: SortOrder
  ) => Promise<any>;
  exportCsv?: (
    search: string,
    sortBy: string,
    sortOrder: SortOrder
  ) => Promise<any>;
  renderRow: (row: T) => React.ReactNode;
  renderTr?: (row: T, cells: React.ReactNode) => JSX.Element;

  /** ✅ NEW (optional, safe) */
  renderRowWrapper?: (rows: T[]) => React.ReactNode;

  searchPlaceholder?: string;
  pageSize?: number;
  extraActions?: React.ReactNode;
}

export default function DataTable<T>({
  title,
  columns,
  fetchData,
  exportCsv,
  renderRow,
  renderRowWrapper, // ✅ NEW
  searchPlaceholder = "Search...",
  pageSize = 10,
  extraActions,
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchData(
        page,
        pageSize,
        debouncedSearch,
        sortBy,
        sortOrder
      );
      if (res?.success) {
        setData(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSort = (key?: string) => {
    if (!key) return;
    setPage(1);
    if (sortBy === key) {
      setSortOrder((p) => (p === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(key);
      setSortOrder("ASC");
    }
  };

  if (loading) return <LoaderInner />;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex gap-2 align-items-center">
        <h5 className="mb-0 fw-semibold me-auto">{title}</h5>

        <input
          className="form-control form-control-sm w-25"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {exportCsv && (
          <button
            className="btn btn-sm btn-outline-success"
            onClick={async () => {
              const res = await exportCsv(
                debouncedSearch,
                sortBy,
                sortOrder
              );
              if (!res?.data) return;
              const url = window.URL.createObjectURL(
                new Blob([res.data])
              );
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "data.csv");
              link.click();
            }}
          >
            <FaDownload className="me-1" />
            Export CSV
          </button>
        )}

        {extraActions}
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-striped align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(c.sortKey)}
                  style={{ width: c.width }}
                >
                  <span role="button">
                    {c.label}
                    {c.sortKey === sortBy &&
                      (sortOrder === "ASC" ? " ▲" : " ▼")}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No records found
                </td>
              </tr>
            )}

            {/* ✅ DEFAULT vs DRAG MODE */}
            {renderRowWrapper
              ? renderRowWrapper(data)
              : data.map((row, i) => (
                  <tr key={i}>{renderRow(row)}</tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer bg-white d-flex justify-content-between">
        <span className="text-muted small">
          Page {page} of {totalPages}
        </span>
      </div>
    </div>
  );
}

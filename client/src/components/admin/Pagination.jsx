import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { A, Panel, StatusPill, EmptyRow, Skeleton, fmtNaira } from "../../pages/adminDashboard/AdminDashboard.jsx";

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm" style={{ color: A.textDim }}>
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="p-2 rounded-lg disabled:opacity-30"
          style={{ background: A.panelAlt }}
        >
          <ChevronLeft size={15} />
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="p-2 rounded-lg disabled:opacity-30"
          style={{ background: A.panelAlt }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
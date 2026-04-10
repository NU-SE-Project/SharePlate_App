import React, { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../../components/common/Button";

const getRangeStart = (meta) =>
  meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;

const getRangeEnd = (meta) => Math.min(meta.page * meta.limit, meta.total);

const AdminUsersPaginationFooter = memo(({ meta, onPrevPage, onNextPage }) => (
  <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <p className="text-sm text-slate-500">
      Showing {getRangeStart(meta)}-{getRangeEnd(meta)} of {meta.total}
    </p>

    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onPrevPage}
        disabled={meta.page <= 1}
        className="rounded-xl border-slate-200 transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <ChevronLeft size={15} className="mr-1.5" />
        Previous
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={meta.page >= Math.max(meta.pages || 1, 1)}
        className="rounded-xl border-slate-200 transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        Next
        <ChevronRight size={15} className="ml-1.5" />
      </Button>
    </div>
  </div>
));

export default AdminUsersPaginationFooter;

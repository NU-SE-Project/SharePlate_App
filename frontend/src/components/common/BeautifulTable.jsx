import React from "react";
import { Loader2, AlertCircle, Search, Filter } from "lucide-react";

/**
 * A beautiful, responsive, and reusable table component.
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of columns { header: string, key: string, render?: (row) => node }
 * @param {Array} props.data - Data array to display
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.error - Error message if any
 * @param {string} props.title - Table title
 * @param {string} props.description - Table description
 */
const BeautifulTable = ({ 
  columns, 
  data = [], 
  isLoading = false, 
  error = null, 
  title, 
  description,
  onSearch,
  searchValue,
  expandableRowRender
}) => {
  const [expandedRows, setExpandedRows] = React.useState(new Set());

  const toggleRow = (rowId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-100 bg-rose-50/50 p-12 text-center animate-fade-in">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Oops! Something went wrong</h3>
        <p className="mt-2 text-slate-600 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-200"
        >
          Try Refreshing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        
        {/* Search Bar */}
        {onSearch && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className="px-6 py-4.5 text-xs font-bold uppercase tracking-widest text-slate-500"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                      <p className="text-sm font-medium text-slate-500">Fetching data...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, rIdx) => (
                  <React.Fragment key={row._id || rIdx}>
                    <tr 
                      className="group transition-colors duration-200 hover:bg-emerald-50/30"
                    >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-6 py-4.5">
                        {col.render ? (
                          col.render(row, { 
                            isExpanded: expandedRows.has(row._id || rIdx),
                            toggleExpand: () => toggleRow(row._id || rIdx)
                          })
                        ) : (
                          <span className="text-[15px] font-medium text-slate-700">
                            {row[col.key] || "-"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandableRowRender && expandedRows.has(row._id || rIdx) && (
                    <tr className="bg-slate-50/30">
                      <td colSpan={columns.length} className="px-6 py-0">
                        <div className="overflow-hidden animate-fade-in">
                          {expandableRowRender(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-50">
                      <Search size={48} className="text-slate-300" />
                      <p className="mt-4 text-slate-500 font-medium tracking-tight">No results found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BeautifulTable;

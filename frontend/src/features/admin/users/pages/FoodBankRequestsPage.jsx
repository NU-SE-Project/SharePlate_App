import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BeautifulTable from "../../../../components/common/BeautifulTable";
import { fetchFoodBankRequests } from "../../services/adminDataService";
import { ArrowLeft, Package, User, Phone, ChevronDown, ChevronRight, CheckCircle2, Clock } from "lucide-react";

const FoodBankRequestsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchFoodBankRequests(id);
        setRequests(data);
      } catch (err) {
        setError("Failed to fetch requests for this food bank.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRequests();
  }, [id]);

  const columns = [
    {
      header: "",
      key: "expand",
      render: (row, { isExpanded, toggleExpand }) => (
        <button 
          onClick={toggleExpand}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isExpanded ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronRight size={20} className="text-slate-500" />}
        </button>
      )
    },
    {
      header: "Request ID",
      key: "_id",
      render: (row) => <span className="text-xs font-mono text-slate-500">{row._id.slice(-8).toUpperCase()}</span>
    },
    {
      header: "Food Item",
      key: "foodName",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-emerald-500" />
          <span className="font-bold text-slate-900">{row.foodName}</span>
        </div>
      )
    },
    {
      header: "Type",
      key: "foodType",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
          row.foodType === "veg" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {row.foodType}
        </span>
      )
    },
    {
      header: "Quantity",
      key: "requestedQuantity",
      render: (row) => (
        <div className="text-sm">
          <span className="font-bold text-slate-700">{row.requestedQuantity - row.remainingQuantity}</span>
          <span className="text-slate-400"> / {row.requestedQuantity} accepted</span>
        </div>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          row.status === "open" 
            ? "bg-blue-50 text-blue-700 border border-blue-100" 
            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
        }`}>
          {row.status === "open" ? <Clock size={12} /> : <CheckCircle2 size={12} />}
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </div>
      )
    }
  ];

  // Custom row rendering to support expansion
  const renderRowExtras = (row) => {
    return (
      <div className="px-12 py-4 border-b border-slate-100">
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Restuarant Acceptances</h4>
          {row.acceptances && row.acceptances.length > 0 ? (
            <div className="grid gap-2">
              {row.acceptances.map((acc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                      {(acc.restaurant_id?.name || "R")?.trim()?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{acc.restaurant_id?.name || "Unknown Restaurant"}</div>
                      <div className="text-xs text-slate-500">{acc.restaurant_id?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase font-bold">Accepted Qty</div>
                      <div className="text-sm font-bold text-slate-700">{acc.acceptedQuantity} servings</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase font-bold">Status</div>
                      <div className={`text-xs font-bold ${acc.status === 'delivered' ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {(acc.status || "unknown").charAt(0).toUpperCase() + (acc.status || "unknown").slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic py-2">No restaurants have accepted this request yet.</div>
          )}
        </div>
      </div>
    );
  };

  const filteredRequests = requests.filter(req => 
    req.foodName?.toLowerCase().includes(search.toLowerCase()) ||
    req.foodType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-10 space-y-6">
      <button 
        onClick={() => navigate("/admin/foodbanks")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} /> Back to Food Banks
      </button>

      <BeautifulTable 
        title="Food Bank Requests"
        description={`Viewing activity for food bank: ${id}`}
        columns={columns}
        data={filteredRequests}
        isLoading={isLoading}
        error={error}
        onSearch={setSearch}
        searchValue={search}
        expandableRowRender={renderRowExtras}
      />
    </div>
  );
};

export default FoodBankRequestsPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BeautifulTable from "../../../../components/common/BeautifulTable";
import { fetchRestaurantDonations } from "../../services/adminDataService";
import { ArrowLeft, Clock, Calendar, CheckCircle2, ChevronRight, ChevronDown, Building2, Phone, Mail } from "lucide-react";

const RestaurantDonationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDonations = async () => {
      try {
        const data = await fetchRestaurantDonations(id);
        setDonations(data);
      } catch (err) {
        setError("Failed to fetch donations for this restaurant.");
      } finally {
        setIsLoading(false);
      }
    };
    loadDonations();
  }, [id]);

  const filteredDonations = donations.filter(don => 
    don.foodName?.toLowerCase().includes(search.toLowerCase()) ||
    don.foodType?.toLowerCase().includes(search.toLowerCase())
  );

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
      header: "Donation",
      key: "foodName",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
            {row.imageUrl ? (
              <img src={row.imageUrl} alt={row.foodName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <Building2 size={24} />
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">{row.foodName}</div>
            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-[150px]">{row.description || "No description"}</div>
          </div>
        </div>
      )
    },
    {
      header: "Quantity",
      key: "totalQuantity",
      render: (row) => (
        <div className="text-sm">
          <span className="font-bold text-slate-700">{row.totalQuantity - row.remainingQuantity}</span>
          <span className="text-slate-400"> / {row.totalQuantity} claimed</span>
        </div>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          row.status === "available" 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
            : row.status === "expired"
            ? "bg-rose-50 text-rose-700 border border-rose-100"
            : "bg-slate-50 text-slate-500 border border-slate-100"
        }`}>
          <div className={`h-1.5 w-1.5 rounded-full ${
            row.status === "available" ? "bg-emerald-500" : row.status === "expired" ? "bg-rose-500" : "bg-slate-400"
          }`} />
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </div>
      )
    },
    {
      header: "Expiry",
      key: "expiryTime",
      render: (row) => (
        <div className="flex items-center gap-1.2 text-xs text-slate-500">
          <Clock size={12} className="shrink-0" />
          <span className="whitespace-nowrap">{new Date(row.expiryTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    }
  ];

  const renderAcceptances = (row) => {
    return (
      <div className="px-12 py-5 border-b border-slate-100">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Food Bank Acceptances</h4>
          </div>
          
          {row.requests && row.requests.length > 0 ? (
            <div className="grid gap-3">
              {row.requests.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-emerald-200 group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                      {req.foodBank_id?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{req.foodBank_id?.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Mail size={10} /> {req.foodBank_id?.email}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Phone size={10} /> {req.foodBank_id?.contactNumber || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Accepted Quantity</div>
                      <div className="text-sm font-bold text-slate-700">{req.requestedQuantity} servings</div>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Status</div>
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${
                        req.status === 'collected' ? 'bg-emerald-100 text-emerald-700' : 
                        req.status === 'approved' ? 'bg-blue-100 text-blue-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="text-sm text-slate-400 italic">No food banks have claimed portions of this donation yet.</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-10 space-y-6">
      <button 
        onClick={() => navigate("/admin/restaurants")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm group"
      >
        <div className="p-1.5 rounded-lg group-hover:bg-slate-100 transition-colors">
          <ArrowLeft size={16} />
        </div>
        Back to Restaurants
      </button>

      <BeautifulTable 
        title="Donation History"
        description={`Monitoring contributions for restaurant: ${id}`}
        columns={columns}
        data={filteredDonations}
        isLoading={isLoading}
        error={error}
        onSearch={setSearch}
        searchValue={search}
        expandableRowRender={renderAcceptances}
      />
    </div>
  );
};

export default RestaurantDonationsPage;

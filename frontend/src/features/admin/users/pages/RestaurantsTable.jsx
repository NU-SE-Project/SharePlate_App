import React, { useState, useEffect } from "react";
import BeautifulTable from "../../../../components/common/BeautifulTable";
import { fetchRestaurants } from "../../services/adminDataService";
import { MapPin, Mail, Phone, Calendar, UtensilsCrossed } from "lucide-react";

const RestaurantsTable = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchRestaurants();
        setData(result);
      } catch (err) {
        setError("Could not load restaurants. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredData = Array.isArray(data) ? data.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.email?.toLowerCase().includes(search.toLowerCase()) ||
    item.address?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const columns = [
    {
      header: "Restaurant",
      key: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.name}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
               <Mail size={12} /> {row.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Address",
      key: "address",
      render: (row) => (
        <div className="flex items-start gap-1.5 max-w-[200px]">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <span className="text-sm text-slate-600 line-clamp-2">{row.address || "No address provided"}</span>
        </div>
      )
    },
    {
      header: "Contact Info",
      key: "contact",
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Phone size={14} className="text-slate-400" />
            {row.contactNumber || "N/A"}
          </div>
        </div>
      )
    },
    {
      header: "Status",
      key: "status",
      render: (row) => (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          row.isActive 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
            : "bg-rose-50 text-rose-700 border border-rose-100"
        }`}>
          <div className={`h-1.5 w-1.5 rounded-full ${row.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
          {row.isActive ? "Active" : "Banned/Inactive"}
        </div>
      )
    },
    {
      header: "Partnership Since",
      key: "createdAt",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Calendar size={14} />
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="pb-10">
      <BeautifulTable 
        title="Restaurant Partners"
        description="Monitor and manage all restaurant partners contributing to the platform."
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        error={error}
        onSearch={setSearch}
        searchValue={search}
      />
    </div>
  );
};

export default RestaurantsTable;

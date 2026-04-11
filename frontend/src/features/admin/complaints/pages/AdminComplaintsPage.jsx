import { useState, useEffect } from "react";
import { 
  Search, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  BarChart3,
  SearchX,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { complaintsApi } from "../../../../utils/complaintsApi";
import AdminComplaintList from "../components/AdminComplaintList";
import Select from "../../../../components/common/Select";
import Input from "../../../../components/common/Input";

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    complainerRole: "",
    complaineeRole: "",
  });

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const activeFilters = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.complainerRole) activeFilters.complainerRole = filters.complainerRole;
      if (filters.complaineeRole) activeFilters.complaineeRole = filters.complaineeRole;

      const response = await complaintsApi.getAllComplaints(activeFilters);
      setComplaints(response);
      
      // Calculate stats (in a real app, this might come from a separate API)
      const total = response.length;
      const pending = response.filter(c => c.status === "pending").length;
      const resolved = response.filter(c => c.status === "resolved").length;
      setStats({ total, pending, resolved });
    } catch (error) {
      toast.error("Failed to load complaints");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReply = async (complaintId, reply) => {
    try {
      await complaintsApi.replyToComplaint(complaintId, reply);
      toast.success("Reply sent successfully");
      loadComplaints();
    } catch (error) {
      toast.error("Failed to send reply");
      console.error(error);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.complainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.complainee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "resolved", label: "Resolved" },
  ];

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "restaurant", label: "Restaurant" },
    { value: "foodbank", label: "Food Bank" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Complaints Dashboard
          </h1>
          <p className="text-lg text-slate-500 mt-2 font-medium">
            Manage and resolve inter-user disputes effectively.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Filed</p>
            <h2 className="text-3xl font-black text-slate-900">{stats.total}</h2>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Awaiting Action</p>
            <h2 className="text-3xl font-black text-slate-900">{stats.pending}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Successfully Resolved</p>
            <h2 className="text-3xl font-black text-slate-900">{stats.resolved}</h2>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by subject, complainer, or target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Role Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-[160px]">
              <Select
                label="From (Complainer)"
                name="complainerRole"
                value={filters.complainerRole}
                onChange={handleFilterChange}
                options={roleOptions}
                containerClassName="!gap-1"
                className="!py-3 !rounded-xl !bg-slate-50 !border-slate-100 focus:!ring-indigo-100"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <Select
                label="Against (Target)"
                name="complaineeRole"
                value={filters.complaineeRole}
                onChange={handleFilterChange}
                options={roleOptions}
                containerClassName="!gap-1"
                className="!py-3 !rounded-xl !bg-slate-50 !border-slate-100 focus:!ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Status Tabs (Replaces simple Select for status) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange({ target: { name: "status", value: opt.value } })}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                filters.status === opt.value
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Active Records
            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg font-black">
              {filteredComplaints.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-4 bg-white rounded-[2rem] border border-slate-50 shadow-sm">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 font-bold animate-pulse">Syncing with database...</p>
          </div>
        ) : filteredComplaints.length > 0 ? (
          <AdminComplaintList complaints={filteredComplaints} onReply={handleReply} />
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[2rem] border border-slate-50 shadow-sm text-center px-6">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <SearchX className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No matching records</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              We couldn't find any complaints matching your current filters or search term. Try adjusting your settings.
            </p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilters({ status: "", complainerRole: "", complaineeRole: "" });
              }}
              className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComplaintsPage;

import { useState, useEffect } from "react";
import { 
  Search, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  BarChart3,
  SearchX,
  Clock,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { complaintsApi } from "../../../../utils/complaintsApi";
import AdminComplaintList from "../components/AdminComplaintList";
import Select from "../../../../components/common/Select";
import LoadingState from "../../../../components/common/LoadingState";

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
    
    if (name === "flow") {
      // Logic for linked filters
      let complainerRole = "";
      let complaineeRole = "";
      
      if (value === "res_to_fb") {
        complainerRole = "restaurant";
        complaineeRole = "foodbank";
      } else if (value === "fb_to_res") {
        complainerRole = "foodbank";
        complaineeRole = "restaurant";
      }
      
      setFilters(prev => ({
        ...prev,
        complainerRole,
        complaineeRole
      }));
      return;
    }

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

  const handleDelete = async (complaintId) => {
    try {
      await complaintsApi.deleteComplaint(complaintId);
      toast.success("Complaint deleted successfully");
      loadComplaints();
    } catch (error) {
      toast.error("Failed to delete complaint");
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

  const roleFlowOptions = [
    { value: "", label: "All User Directions" },
    { value: "res_to_fb", label: "Restaurant complaints Food Bank" },
    { value: "fb_to_res", label: "Food Bank complaints Restaurant" },
  ];

  // Derive initial flow value from filters for the Select component
  const getFlowValue = () => {
    if (filters.complainerRole === "restaurant" && filters.complaineeRole === "foodbank") return "res_to_fb";
    if (filters.complainerRole === "foodbank" && filters.complaineeRole === "restaurant") return "fb_to_res";
    return "";
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Complaints Dashboard
          </h1>
          <p className="text-base md:text-lg text-slate-500 mt-1 md:mt-2 font-medium">
            Manage and resolve inter-user disputes effectively.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs md:sm font-semibold text-slate-400 bg-slate-50 px-3 md:px-4 py-2 rounded-xl border border-slate-100 w-fit">
          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 md:gap-5 transition-transform hover:scale-[1.02]">
          <div className="p-3 md:p-4 bg-indigo-50 rounded-xl md:rounded-2xl text-indigo-600">
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Total Filed</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{stats.total}</h2>
          </div>
        </div>
        
        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 md:gap-5 transition-transform hover:scale-[1.02]">
          <div className="p-3 md:p-4 bg-amber-50 rounded-xl md:rounded-2xl text-amber-600">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Awaiting Action</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{stats.pending}</h2>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 md:gap-5 transition-transform hover:scale-[1.02]">
          <div className="p-3 md:p-4 bg-emerald-50 rounded-xl md:rounded-2xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{stats.resolved}</h2>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          {/* Search bar - Flex grow to fill space */}
          <div className="flex-1 space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Search Records</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Subject or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl md:rounded-2xl outline-none transition-all text-sm text-slate-700 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Case Status</label>
            <div className="flex bg-slate-50 p-1 rounded-xl md:rounded-2xl border border-slate-100 h-[52px] items-center">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterChange({ target: { name: "status", value: opt.value } })}
                  className={`px-4 md:px-6 h-full rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all ${
                    filters.status === opt.value
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Flow Filter */}
          <div className="w-full lg:w-72 space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Complaint Direction</label>
            <Select
              name="flow"
              value={getFlowValue()}
              onChange={handleFilterChange}
              options={roleFlowOptions}
              containerClassName="!gap-1"
              className="!py-3 !h-[52px] !rounded-xl md:!rounded-2xl !bg-slate-50 !border-slate-100 focus:!ring-indigo-100 !text-xs md:!text-sm !font-bold !text-slate-700"
            />
          </div>

          {/* Clear Button */}
          {(searchTerm || filters.status || filters.complainerRole || filters.complaineeRole) && (
            <div className="flex items-end h-[52px] lg:mb-0">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilters({ status: "", complainerRole: "", complaineeRole: "" });
                  toast.success("Filters cleared");
                }}
                className="flex items-center gap-2 h-full px-5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl md:rounded-2xl text-xs md:text-sm font-black transition-all border border-rose-100 group shadow-sm shadow-rose-100 shrink-0"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 md:px-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
            Active Records
            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] md:text-xs rounded-lg font-black">
              {filteredComplaints.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <LoadingState
            title="Loading complaints"
            message="Please wait while we fetch the latest complaint records."
            minHeightClassName="min-h-96"
          />
        ) : filteredComplaints.length > 0 ? (
          <AdminComplaintList 
            complaints={filteredComplaints} 
            onReply={handleReply} 
            onDelete={handleDelete}
          />
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

import { useState, useEffect } from "react";
import { 
  Plus, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  LayoutDashboard,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { complaintsApi } from "../../../../utils/complaintsApi";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintList from "../components/ComplaintList";
import LoadingState from "../../../../components/common/LoadingState";

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [targets, setTargets] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState(""); // "" | "pending" | "resolved"
  const [editingComplaint, setEditingComplaint] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, targetsRes] = await Promise.all([
        complaintsApi.getMyComplaints(),
        complaintsApi.getComplaintTargets(),
      ]);
      setComplaints(complaintsRes);
      setTargets(targetsRes);

      // Calculate stats
      const total = complaintsRes.length;
      const pending = complaintsRes.filter(c => c.status === "pending").length;
      const resolved = complaintsRes.filter(c => c.status === "resolved").length;
      setStats({ total, pending, resolved });
    } catch (error) {
      toast.error("Failed to load complaints data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (complaintData) => {
    try {
      if (editingComplaint) {
        await complaintsApi.updateComplaint(editingComplaint._id, complaintData);
        toast.success("Complaint updated successfully");
      } else {
        await complaintsApi.createComplaint(complaintData);
        toast.success("Complaint submitted successfully");
      }
      setShowForm(false);
      setEditingComplaint(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
      console.error(error);
    }
  };

  const handleDelete = async (complaintId) => {
    try {
      await complaintsApi.deleteComplaint(complaintId);
      toast.success("Complaint removed successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete complaint");
      console.error(error);
    }
  };

  const handleEdit = (complaint) => {
    setEditingComplaint(complaint);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingComplaint(null);
  };

  const filteredComplaints = statusFilter 
    ? complaints.filter(c => c.status === statusFilter)
    : complaints;

  if (loading) {
    return (
      <LoadingState
        title="Loading complaints"
        message="Please wait while we fetch your latest complaint records."
        minHeightClassName="min-h-96"
      />
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] md:text-xs mb-2 md:mb-3">
            <LayoutDashboard className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Support Center
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            My Complaints
          </h1>
          <p className="text-base md:text-lg text-slate-500 mt-2 font-medium">
            Track and manage your reports regarding other platform users.
          </p>
        </div>
        
        <button
          onClick={() => {
            if (showForm) handleCancelForm();
            else setShowForm(true);
          }}
          className={`
            flex items-center justify-center gap-3 px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300 shadow-lg w-full md:w-auto
            ${showForm 
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 md:scale-105 active:scale-95"
            }
          `}
        >
          {showForm ? (
            <>
              <X className="w-5 h-5" />
              Cancel {editingComplaint ? "Edit" : "Reporting"}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              File New Complaint
            </>
          )}
        </button>
      </div>
      {/* Stats Summary */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => setStatusFilter("")}
            className={`bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border flex items-center gap-4 md:gap-5 transition-all text-left group ${statusFilter === "" ? "ring-2 ring-indigo-500 border-indigo-100 bg-indigo-50/10" : "border-slate-100 hover:border-indigo-200 hover:shadow-md"}`}
          >
            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-colors ${statusFilter === "" ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"}`}>
              <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">{stats.total}</h2>
            </div>
          </button>
          
          <button 
            onClick={() => setStatusFilter("pending")}
            className={`bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border flex items-center gap-4 md:gap-5 transition-all text-left group ${statusFilter === "pending" ? "ring-2 ring-amber-500 border-amber-100 bg-amber-50/10" : "border-slate-100 hover:border-amber-200 hover:shadow-md"}`}
          >
            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-colors ${statusFilter === "pending" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:text-amber-700"}`}>
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Under Review</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">{stats.pending}</h2>
            </div>
          </button>

          <button 
            onClick={() => setStatusFilter("resolved")}
            className={`bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border flex items-center gap-4 md:gap-5 transition-all text-left group ${statusFilter === "resolved" ? "ring-2 ring-emerald-500 border-emerald-100 bg-emerald-50/10" : "border-slate-100 hover:border-emerald-200 hover:shadow-md"}`}
          >
            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-colors ${statusFilter === "resolved" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"}`}>
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">{stats.resolved}</h2>
            </div>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative">
        {showForm ? (
          <ComplaintForm
            targets={targets}
            initialData={editingComplaint}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-slate-800">
                  {statusFilter === "" ? "Recent Records" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Records`}
                </h2>
                <div className="h-px bg-slate-100 w-24 hidden sm:block"></div>
              </div>
              
              {statusFilter && (
                <button 
                  onClick={() => setStatusFilter("")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <ComplaintList 
              complaints={filteredComplaints} 
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsPage;

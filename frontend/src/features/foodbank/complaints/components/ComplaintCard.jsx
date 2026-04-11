import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  User,
  Trash2,
  Pencil
} from "lucide-react";

const ComplaintCard = ({ complaint, onDelete, onEdit }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusConfig = {
    resolved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-100",
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Resolved"
    },
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
      icon: <Clock className="w-4 h-4" />,
      label: "Pending Review"
    }
  };

  const status = statusConfig[complaint.status] || statusConfig.pending;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 md:p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-xl text-slate-400 shrink-0">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 leading-tight truncate px-1">
              {complaint.subject}
            </h3>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold mt-1 md:mt-0.5 flex items-center gap-1 tracking-tight">
              <User className="w-3 h-3 text-indigo-400" />
              <span className="uppercase text-[9px] tracking-widest opacity-70">Against:</span> 
              <span className="text-slate-600 ml-0.5">{complaint.complainee.name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 shrink-0 self-end sm:self-center">
          {complaint.status === "pending" && (
            <>
              <button
                onClick={() => onEdit(complaint)}
                className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                title="Edit Complaint"
              >
                <Pencil className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to withdraw this complaint? This cannot be undone.")) {
                    onDelete(complaint._id);
                  }
                }}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Withdraw Complaint"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border w-fit ${status.bg} ${status.text} ${status.border}`}>
            {status.icon}
            {status.label}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {complaint.description}
        </p>

        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 opacity-60">
          <Clock className="w-3 h-3" />
          Filed on {formatDate(complaint.createdAt)}
        </div>

        {complaint.adminReply && (
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin Resolution</span>
            </div>
            <p className="text-indigo-900 text-sm leading-relaxed font-medium">
              {complaint.adminReply}
            </p>
            <div className="text-[10px] text-indigo-400 font-bold text-right italic">
              Resolved {formatDate(complaint.updatedAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;

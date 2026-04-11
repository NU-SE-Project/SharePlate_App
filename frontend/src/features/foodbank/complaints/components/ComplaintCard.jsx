import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  User 
} from "lucide-react";

const ComplaintCard = ({ complaint }) => {
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
      <div className="p-5 border-b border-slate-50 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">
              {complaint.subject}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <User className="w-3 h-3" />
              Against: {complaint.complainee.name}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.bg} ${status.text} ${status.border}`}>
          {status.icon}
          {status.label}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {complaint.description}
        </p>

        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 opacity-60">
          <Clock className="w-3 h-3" />
          FILED ON {formatDate(complaint.createdAt).toUpperCase()}
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

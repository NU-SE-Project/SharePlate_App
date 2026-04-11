import { useState } from "react";
import { 
  User, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare, 
  Clock, 
  ArrowRight,
  Send,
  X
} from "lucide-react";
import Button from "../../../../components/common/Button";

const AdminComplaintCard = ({ complaint, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

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
      icon: <CheckCircle className="w-4 h-4" />,
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

  const handleReply = async () => {
    if (!replyText.trim()) return;

    setLoading(true);
    try {
      await onReply(complaint._id, replyText.trim());
      setReplyText("");
      setShowReplyForm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-slate-50 bg-slate-50/30">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {complaint.subject}
            </h3>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-slate-700">{complaint.complainer.name}</span>
                <span className="text-slate-400 capitalize">({complaint.complainer.role})</span>
              </div>
              
              <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block" />

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-slate-700">{complaint.complainee.name}</span>
                <span className="text-slate-400 capitalize">({complaint.complainee.role})</span>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border}`}>
            {status.icon}
            {status.label}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose prose-slate max-w-none mb-6">
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap italic">
            "{complaint.description}"
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium tracking-wide uppercase">
          <Clock className="w-3.5 h-3.5" />
          Filed on {formatDate(complaint.createdAt)}
        </div>

        {complaint.adminReply && (
          <div className="mt-6 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 relative group">
            <div className="absolute -top-3 left-4 bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              OFFICIAL REPLY
            </div>
            <p className="text-indigo-900 text-sm leading-relaxed font-medium">
              {complaint.adminReply}
            </p>
            <div className="mt-2 text-[10px] text-indigo-400 font-bold text-right italic">
              Resolved on {formatDate(complaint.updatedAt)}
            </div>
          </div>
        )}

        {complaint.status === "pending" && !showReplyForm && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowReplyForm(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all focus:ring-4 focus:ring-slate-100"
            >
              <Send className="w-4 h-4" />
              Respond to Complaint
            </button>
          </div>
        )}

        {showReplyForm && (
          <div className="mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  Compose Response
                </h4>
                <button onClick={() => setShowReplyForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all text-slate-700 placeholder:text-slate-300"
                placeholder="Type your official resolution here..."
              />
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleReply}
                  disabled={loading || !replyText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 font-bold py-3 shadow-lg shadow-emerald-100"
                >
                  {loading ? "Sending..." : "Submit Resolution & Resolve"}
                </Button>
                <Button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText("");
                  }}
                  variant="secondary"
                  className="px-6 font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComplaintCard;

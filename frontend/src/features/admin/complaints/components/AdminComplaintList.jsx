import AdminComplaintCard from "./AdminComplaintCard";

const AdminComplaintList = ({ complaints, onReply, onDelete }) => {
  if (complaints.length === 0) {
    return <div className="text-center py-12 text-slate-500">No complaints found.</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {complaints.map((complaint) => (
        <AdminComplaintCard
          key={complaint._id}
          complaint={complaint}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AdminComplaintList;

import AdminComplaintCard from "./AdminComplaintCard";

const AdminComplaintList = ({ complaints, onReply }) => {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No complaints found</div>
        <div className="text-gray-400 text-sm mt-2">
          There are no complaints to review.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <AdminComplaintCard
          key={complaint._id}
          complaint={complaint}
          onReply={onReply}
        />
      ))}
    </div>
  );
};

export default AdminComplaintList;

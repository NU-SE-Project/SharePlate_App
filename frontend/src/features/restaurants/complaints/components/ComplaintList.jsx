import ComplaintCard from "./ComplaintCard";

const ComplaintList = ({ complaints }) => {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No complaints found</div>
        <div className="text-gray-400 text-sm mt-2">
          You haven't filed any complaints yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <ComplaintCard key={complaint._id} complaint={complaint} />
      ))}
    </div>
  );
};

export default ComplaintList;

import ComplaintCard from "./ComplaintCard";

const ComplaintList = ({ complaints, onDelete, onEdit }) => {
  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 text-center px-6">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records found</p>
        <p className="text-slate-500 mt-2 text-sm font-medium">You haven't filed any complaints matching this filter yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {complaints.map((complaint) => (
        <ComplaintCard 
          key={complaint._id} 
          complaint={complaint} 
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default ComplaintList;

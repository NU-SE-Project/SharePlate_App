import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { complaintsApi } from "../../../../utils/complaintsApi";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintList from "../components/ComplaintList";

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
    } catch (error) {
      toast.error("Failed to load complaints data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (complaintData) => {
    try {
      await complaintsApi.createComplaint(complaintData);
      toast.success("Complaint submitted successfully");
      setShowForm(false);
      loadData(); // Refresh the list
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit complaint",
      );
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          File New Complaint
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <ComplaintForm
            targets={targets}
            onSubmit={handleCreateComplaint}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <ComplaintList complaints={complaints} />
    </div>
  );
};

export default ComplaintsPage;

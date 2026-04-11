import { useState } from "react";
import { Send, X, AlertCircle } from "lucide-react";
import Input from "../../../../components/common/Input";
import Combobox from "../../../../components/common/Combobox";
import Button from "../../../../components/common/Button";

const ComplaintForm = ({ targets, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    complaineeId: initialData?.complainee?._id || initialData?.complaineeId || "",
    subject: initialData?.subject || "",
    description: initialData?.description || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.complaineeId ||
      !formData.subject.trim() ||
      !formData.description.trim()
    ) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ complaineeId: "", subject: "", description: "" });
    } finally {
      setLoading(false);
    }
  };

  const targetOptions = targets.map((target) => ({
    value: target._id,
    label: `${target.name} (${target.email})`,
  }));

  return (
    <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-4 mb-6 md:mb-8 text-center sm:text-left">
        <div className="p-3 bg-amber-50 rounded-xl md:rounded-2xl text-amber-600">
          <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {initialData ? "Update Complaint Details" : "File a Formal Complaint"}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Please provide accurate details for admin review.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <Combobox
          label="Complain About"
          name="complaineeId"
          value={formData.complaineeId}
          onChange={handleChange}
          options={targetOptions}
          placeholder="Search and select an entity..."
          required
        />

        <Input
          label="Subject of Concern"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g., Late delivery, Quality issues..."
          required
          className="!py-3 md:!py-3.5 !rounded-xl !bg-slate-50 border-none focus:!ring-indigo-100 focus:!bg-white !text-sm"
        />

        <div>
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2 ml-1">
            Detailed Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 border-none rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all text-sm md:text-base text-slate-700 placeholder:text-slate-400 font-medium"
            placeholder="Please describe the incident in detail..."
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white flex-1 py-3.5 md:py-4 !rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-lg shadow-slate-200"
          >
            <div className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              {loading 
                ? (initialData ? "Updating..." : "Submitting...") 
                : (initialData ? "Update Report" : "Submit Complaint")
              }
            </div>
          </Button>
          <Button 
            type="button" 
            onClick={onCancel} 
            variant="secondary"
            className="!rounded-xl md:rounded-2xl py-3.5 md:py-4 px-8 border-2 border-slate-100 hover:bg-slate-50 transition-colors font-bold text-sm md:text-base text-slate-600"
          >
            <div className="flex items-center justify-center gap-2">
              <X className="w-4 h-4 md:w-5 md:h-5" />
              Cancel
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;

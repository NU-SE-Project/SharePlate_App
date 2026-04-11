import { useState } from "react";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Button from "../../../../components/common/Button";

const ComplaintForm = ({ targets, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    complaineeId: "",
    subject: "",
    description: "",
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
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-xl font-semibold mb-4">File a Complaint</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Complain About"
          name="complaineeId"
          value={formData.complaineeId}
          onChange={handleChange}
          options={targetOptions}
          placeholder="Select an entity to complain about"
          required
        />

        <Input
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Brief subject of your complaint"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your complaint in detail"
            required
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </Button>
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;

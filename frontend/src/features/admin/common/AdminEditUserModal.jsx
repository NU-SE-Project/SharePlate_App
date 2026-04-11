import React, { memo } from "react";
import { Loader2 } from "lucide-react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Modal from "../../../components/common/Modal";
import Select from "../../../components/common/Select";

const AdminEditUserModal = memo(
  ({
    editTarget,
    editForm,
    editErrors,
    isSaving,
    roleOptions,
    verificationOptions,
    onClose,
    onChange,
    onSubmit,
  }) => (
    <Modal
      isOpen={Boolean(editTarget)}
      onClose={onClose}
      title={editTarget ? `Edit ${editTarget.name}` : "Edit user"}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            name="name"
            value={editForm.name}
            onChange={onChange}
            error={editErrors.name}
          />

          <Input
            label="Email"
            value={editTarget?.email || ""}
            disabled
            className="bg-slate-50 text-slate-400"
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={editForm.address}
          onChange={onChange}
          error={editErrors.address}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Contact Number"
            name="contactNumber"
            value={editForm.contactNumber}
            onChange={onChange}
            error={editErrors.contactNumber}
          />

          <Select
            label="Role"
            name="role"
            value={editForm.role}
            onChange={onChange}
            options={roleOptions}
            error={editErrors.role}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Verification Status"
            name="verificationStatus"
            value={editForm.verificationStatus}
            onChange={onChange}
            options={verificationOptions}
            error={editErrors.verificationStatus}
          />

          <Input
            label="Verified At"
            name="verifiedAt"
            type="datetime-local"
            value={editForm.verifiedAt}
            onChange={onChange}
            error={editErrors.verifiedAt}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Latitude"
            name="latitude"
            value={editForm.latitude}
            onChange={onChange}
            error={editErrors.latitude}
          />

          <Input
            label="Longitude"
            name="longitude"
            value={editForm.longitude}
            onChange={onChange}
            error={editErrors.longitude}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-emerald-50">
          <input
            type="checkbox"
            name="isActive"
            checked={editForm.isActive}
            onChange={onChange}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Keep this account active
        </label>

        {editErrors.server ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {editErrors.server}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-green-800 hover:bg-green-900 focus-visible:ring-2 focus-visible:ring-green-800 focus-visible:ring-offset-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  ),
);

export default AdminEditUserModal;

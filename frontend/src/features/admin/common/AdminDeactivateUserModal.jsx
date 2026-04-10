import React, { memo } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";

const AdminDeactivateUserModal = memo(
  ({ deleteTarget, isDeleting, onClose, onConfirm }) => (
    <Modal
      isOpen={Boolean(deleteTarget)}
      onClose={onClose}
      title="Deactivate account"
    >
      <div className="space-y-5">
        <div className="rounded-[1.75rem] border border-amber-100 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <div>
              <p className="font-semibold text-slate-900">
                This will deactivate the account and revoke active sessions.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                User: <span className="font-semibold">{deleteTarget?.name}</span>
                <br />
                Email:{" "}
                <span className="font-semibold">{deleteTarget?.email}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="rounded-xl bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Deactivating...
              </>
            ) : (
              "Deactivate account"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  ),
);

export default AdminDeactivateUserModal;

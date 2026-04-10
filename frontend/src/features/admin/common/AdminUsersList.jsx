import React, { memo } from "react";
import { MapPin, PencilLine, Trash2 } from "lucide-react";
import Button from "../../../components/common/Button";

const formatRole = (role) => {
  if (!role) return "Unknown";
  if (role === "foodbank") return "Food Bank";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const formatDate = (value) => {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const formatVerificationStatus = (value) => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getUserCoordinates = (user) => user?.location?.coordinates || [];
const isAdminUser = (user) => user?.role === "admin";

const getStatusBadgeClass = (isActive) =>
  isActive
    ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
    : "border-rose-200/80 bg-rose-50 text-rose-700";

const getVerificationBadgeClass = (status) => {
  switch (status) {
    case "verified":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200/80 bg-amber-50 text-amber-700";
    case "rejected":
      return "border-rose-200/80 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const StatusBadge = memo(({ isActive }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${getStatusBadgeClass(
      isActive,
    )}`}
  >
    <span
      className={`mr-2 h-1.5 w-1.5 rounded-full ${
        isActive ? "bg-emerald-500" : "bg-rose-500"
      }`}
    />
    {isActive ? "Active" : "Inactive"}
  </span>
));

const VerificationBadge = memo(({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${getVerificationBadgeClass(
      status,
    )}`}
  >
    {formatVerificationStatus(status)}
  </span>
));

const TableActionButton = memo(
  ({ children, variant = "outline", className = "", ...props }) => (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={`rounded-xl transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </Button>
  ),
);

const UserIdentity = memo(({ user, isSelf }) => (
  <div className="min-w-0">
    <div className="flex flex-wrap items-center gap-2">
      <p className="font-semibold text-slate-900">{user.name}</p>
      {isSelf ? (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          You
        </span>
      ) : null}
    </div>

    <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
  </div>
));

const UserAddress = memo(({ address }) => (
  <div className="inline-flex items-start gap-2 text-xs text-slate-500">
    <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-600" />
    <span>{address}</span>
  </div>
));

const UserActions = memo(({ user, onEdit, onDeactivate, disableDeactivate }) => (
  <div className="flex flex-wrap gap-2">
    <TableActionButton onClick={() => onEdit(user)}>
      <PencilLine size={15} className="mr-1.5" />
      Edit
    </TableActionButton>

    <TableActionButton
      variant="ghost"
      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      onClick={() => onDeactivate(user)}
      disabled={disableDeactivate}
    >
      <Trash2 size={15} className="mr-1.5" />
      Deactivate
    </TableActionButton>
  </div>
));

const UserTableRow = memo(
  ({ user, isSelf, onEdit, onDeactivate, disableDeactivate }) => {
    const coordinates = getUserCoordinates(user);

    return (
      <tr className="group align-top transition-colors duration-200 hover:bg-emerald-50/40">
        <td className="px-6 py-5">
          <UserIdentity user={user} isSelf={isSelf} />
          <div className="mt-2">
            <UserAddress address={user.address} />
          </div>
        </td>

        <td className="px-6 py-5 text-sm font-medium text-slate-700">
          {formatRole(user.role)}
        </td>

        <td className="px-6 py-5">
          <StatusBadge isActive={user.isActive} />
        </td>

        <td className="px-6 py-5">
          <div className="space-y-2">
            <VerificationBadge status={user.verificationStatus} />
            <p className="text-xs text-slate-400">
              {formatDate(user.verifiedAt)}
            </p>
          </div>
        </td>

        <td className="px-6 py-5 text-sm text-slate-600">
          <p>{user.contactNumber}</p>
          <p className="mt-1 text-xs text-slate-400">
            {coordinates[1] ?? "N/A"}, {coordinates[0] ?? "N/A"}
          </p>
        </td>

        <td className="px-6 py-5 text-sm text-slate-600">
          {formatDate(user.createdAt)}
        </td>

        <td className="px-6 py-5">
          <UserActions
            user={user}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            disableDeactivate={disableDeactivate}
          />
        </td>
      </tr>
    );
  },
);

const MobileUserCard = memo(
  ({ user, isSelf, onEdit, onDeactivate, disableDeactivate }) => (
    <div className="group rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_40px_-28px_rgba(5,150,105,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <UserIdentity user={user} isSelf={isSelf} />

        <StatusBadge isActive={user.isActive} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Role
          </p>
          <p className="mt-1 font-medium text-slate-700">
            {formatRole(user.role)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Verification
          </p>
          <div className="mt-1">
            <VerificationBadge status={user.verificationStatus} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Verified At
          </p>
          <p className="mt-1">{formatDate(user.verifiedAt)}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Contact
          </p>
          <p className="mt-1">{user.contactNumber}</p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Address
          </p>
          <div className="mt-1">
            <UserAddress address={user.address} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Created
          </p>
          <p className="mt-1">{formatDate(user.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4">
        <UserActions
          user={user}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          disableDeactivate={disableDeactivate}
        />
      </div>
    </div>
  ),
);

const AdminUsersList = memo(
  ({ users, currentUserId, onEdit, onDeactivate }) => (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Verification</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <UserTableRow
                key={user._id}
                user={user}
                isSelf={user._id === currentUserId}
                onEdit={onEdit}
                onDeactivate={onDeactivate}
                disableDeactivate={isAdminUser(user)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 p-4 lg:hidden">
        {users.map((user) => (
          <MobileUserCard
            key={user._id}
            user={user}
            isSelf={user._id === currentUserId}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            disableDeactivate={isAdminUser(user)}
          />
        ))}
      </div>
    </>
  ),
);

export default AdminUsersList;

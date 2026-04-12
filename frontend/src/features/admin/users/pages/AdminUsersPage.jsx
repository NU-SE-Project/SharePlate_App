import React, {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import Card from "../../../../components/common/Card";
import Button from "../../../../components/common/Button";
import AdminDeactivateUserModal from "../../common/AdminDeactivateUserModal";
import AdminEditUserModal from "../../common/AdminEditUserModal";
import AdminUsersFilterBar from "../../common/AdminUsersFilterBar";
import AdminUsersList from "../../common/AdminUsersList";
import AdminUsersPaginationFooter from "../../common/AdminUsersPaginationFooter";
import { useAuth } from "../../../../context/AuthContext";
import SharedLoadingState from "../../../../components/common/LoadingState";
import {
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
} from "../../services/adminUserService";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "restaurant", label: "Restaurant" },
  { value: "foodbank", label: "Food Bank" },
  { value: "admin", label: "Administrator" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "true", label: "Active only" },
  { value: "false", label: "Inactive only" },
];

const EDIT_ROLE_OPTIONS = ROLE_OPTIONS.filter((option) => option.value);

const VERIFICATION_OPTIONS = [
  { value: "unverified", label: "Unverified" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const PAGE_SIZE = 10;
const DEFAULT_META = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  pages: 1,
};

const getUserId = (user) => user?._id || user?.id || "";

const formatDateTimeLocalValue = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const createEditForm = (user) => ({
  name: user?.name || "",
  address: user?.address || "",
  contactNumber: user?.contactNumber || "",
  role: user?.role || "restaurant",
  isActive: Boolean(user?.isActive),
  verificationStatus: user?.verificationStatus || "unverified",
  verifiedAt: formatDateTimeLocalValue(user?.verifiedAt),
  latitude: user?.location?.coordinates?.[1]?.toString() || "",
  longitude: user?.location?.coordinates?.[0]?.toString() || "",
});

const SummaryCard = memo(({ icon, label, value, tone = "default" }) => {
  const IconComponent = icon;

  const toneClass =
    tone === "emerald"
      ? "border-emerald-200/70 bg-emerald-50 text-emerald-700"
      : tone === "green"
        ? "border-green-200/70 bg-green-50 text-green-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <Card className="group rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-35px_rgba(16,24,40,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-36px_rgba(5,150,105,0.35)]">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-105 ${toneClass}`}
        >
          <IconComponent size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
});

const EmptyState = memo(() => (
  <div className="px-6 py-14">
    <div className="mx-auto max-w-xl rounded-[1.75rem] border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-emerald-50/40 p-8 text-center">
      <Users className="mx-auto text-slate-400" size={24} />
      <p className="mt-4 text-base font-semibold text-slate-900">
        No users matched this filter
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Adjust the current search or filters to broaden the result set.
      </p>
    </div>
  </div>
));

const ErrorState = memo(({ error, onRetry }) => (
  <div className="px-6 py-14">
    <div className="mx-auto max-w-xl rounded-[1.75rem] border border-rose-100 bg-rose-50 p-6 text-center shadow-sm">
      <AlertTriangle className="mx-auto text-rose-600" size={24} />
      <p className="mt-4 text-base font-semibold text-slate-900">
        Could not load the user list
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
      <Button
        type="button"
        className="mt-5 rounded-xl bg-green-800 hover:bg-green-900 focus-visible:ring-green-800"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  </div>
));

const UsersLoadingState = memo(() => (
  <SharedLoadingState
    title="Loading users"
    message="Please wait while we fetch the latest user records."
    minHeightClassName="min-h-72"
    panelClassName="border-0 bg-transparent shadow-none"
  />
));


const AdminUsersPage = () => {
  const auth = useAuth();

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(DEFAULT_META);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [error, setError] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(createEditForm(null));
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deferredSearch = useDeferredValue(search.trim());
  const currentUserId = useMemo(() => getUserId(auth.user), [auth.user]);

  useEffect(() => {
    setMeta((prev) => ({ ...prev, page: 1 }));
  }, [deferredSearch, roleFilter, statusFilter]);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page: meta.page,
          limit: PAGE_SIZE,
        };

        if (deferredSearch) params.search = deferredSearch;
        if (roleFilter) params.role = roleFilter;
        if (statusFilter !== "all") params.isActive = statusFilter;

        const response = await listAdminUsers(params);

        if (!isMounted) return;

        setUsers(Array.isArray(response?.data) ? response.data : []);
        setMeta((prev) => ({
          ...prev,
          ...(response?.meta || {}),
        }));
      } catch (fetchError) {
        if (!isMounted) return;

        console.error("Failed to load admin users:", fetchError);
        setError(
          fetchError?.response?.data?.message ||
            "Unable to load users. Please try again.",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [deferredSearch, meta.page, refreshTick, roleFilter, statusFilter]);

  const activeCount = useMemo(
    () => users.filter((user) => user.isActive).length,
    [users],
  );

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users],
  );

  const summary = useMemo(
    () => [
      { icon: Users, label: "Visible Users", value: users.length },
      {
        icon: ShieldCheck,
        label: "Active in View",
        value: activeCount,
        tone: "emerald",
      },
      {
        icon: UserRound,
        label: "Admins in View",
        value: adminCount,
        tone: "green",
      },
    ],
    [activeCount, adminCount, users.length],
  );

  const handleRefresh = useCallback(() => {
    setRefreshTick((tick) => tick + 1);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const handleRoleFilterChange = useCallback((event) => {
    setRoleFilter(event.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((event) => {
    setStatusFilter(event.target.value);
  }, []);

  const handleEditOpen = useCallback((user) => {
    setEditTarget(user);
    setEditErrors({});
    setEditForm(createEditForm(user));
  }, []);

  const handleEditClose = useCallback(() => {
    setEditTarget(null);
    setEditErrors({});
    setEditForm(createEditForm(null));
  }, []);

  const handleEditChange = useCallback(
    (event) => {
      const { name, type, checked, value } = event.target;

      setEditForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if (editErrors[name]) {
        setEditErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [editErrors],
  );

  const validateEditForm = useCallback(() => {
    const nextErrors = {};

    if (!editForm.name.trim()) nextErrors.name = "Name is required";
    if (!editForm.address.trim()) nextErrors.address = "Address is required";

    if (!editForm.contactNumber.trim()) {
      nextErrors.contactNumber = "Contact number is required";
    }

    if (!editForm.role) nextErrors.role = "Role is required";

    if (!editForm.verificationStatus) {
      nextErrors.verificationStatus = "Verification status is required";
    }

    if (editForm.latitude === "" || Number.isNaN(Number(editForm.latitude))) {
      nextErrors.latitude = "Latitude must be a valid number";
    }

    if (editForm.longitude === "" || Number.isNaN(Number(editForm.longitude))) {
      nextErrors.longitude = "Longitude must be a valid number";
    }

    if (
      editForm.verifiedAt &&
      Number.isNaN(new Date(editForm.verifiedAt).getTime())
    ) {
      nextErrors.verifiedAt = "Verified at must be a valid date and time";
    }

    return nextErrors;
  }, [editForm]);

  const handleEditSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!editTarget) return;

      const validationErrors = validateEditForm();
      if (Object.keys(validationErrors).length > 0) {
        setEditErrors(validationErrors);
        return;
      }

      const payload = {
        name: editForm.name.trim(),
        address: editForm.address.trim(),
        contactNumber: editForm.contactNumber.trim(),
        role: editForm.role,
        isActive: Boolean(editForm.isActive),
        verificationStatus: editForm.verificationStatus,
        verifiedAt: editForm.verifiedAt
          ? new Date(editForm.verifiedAt).toISOString()
          : null,
        location: {
          type: "Point",
          coordinates: [Number(editForm.longitude), Number(editForm.latitude)],
        },
      };

      setIsSaving(true);

      try {
        const response = await updateAdminUser(editTarget._id, payload);
        const updatedUser = response?.user;

        setUsers((prev) =>
          prev.map((user) =>
            user._id === updatedUser?._id ? updatedUser : user,
          ),
        );

        if (updatedUser?._id === currentUserId) {
          auth.setUser(updatedUser);
        }

        toast.success(response?.message || "User updated successfully.");
        handleEditClose();
      } catch (saveError) {
        console.error("Failed to update user:", saveError);
        setEditErrors((prev) => ({
          ...prev,
          server:
            saveError?.response?.data?.message || "Unable to update this user.",
        }));
      } finally {
        setIsSaving(false);
      }
    },
    [auth, currentUserId, editForm, editTarget, handleEditClose, validateEditForm],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      const response = await deactivateAdminUser(deleteTarget._id);
      toast.success(
        response?.message || "User account deactivated successfully.",
      );

      if (deleteTarget._id === currentUserId) {
        await auth.logout();
        window.location.assign("/auth/login");
        return;
      }

      setDeleteTarget(null);
      handleRefresh();
    } catch (deleteError) {
      console.error("Failed to deactivate user:", deleteError);
      toast.error(
        deleteError?.response?.data?.message ||
          "Unable to deactivate this user.",
      );
    } finally {
      setIsDeleting(false);
    }
  }, [auth, currentUserId, deleteTarget, handleRefresh]);

  const handleDeleteClose = useCallback(() => {
    if (!isDeleting) setDeleteTarget(null);
  }, [isDeleting]);

  const handlePrevPage = useCallback(() => {
    setMeta((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  const handleNextPage = useCallback(() => {
    setMeta((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, Math.max(prev.pages || 1, 1)),
    }));
  }, []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-emerald-50/60 to-green-50/70 p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(21,128,61,0.10),transparent_35%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
              <ShieldCheck size={14} />
              Admin user management
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Manage registered accounts
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Review, filter, edit, and deactivate accounts from one clean
              dashboard without touching the backend directly.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Sparkles size={16} className="text-emerald-600" />
              Total matching users
            </div>
            <p className="mt-1 text-3xl font-bold tracking-tight text-green-800">
              {meta.total}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <AdminUsersFilterBar
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        roleOptions={ROLE_OPTIONS}
        statusOptions={STATUS_OPTIONS}
        onSearchChange={handleSearchChange}
        onRoleFilterChange={handleRoleFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
        onRefresh={handleRefresh}
      />

      <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-emerald-50/40 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            User directory
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Page {meta.page} of {Math.max(meta.pages || 1, 1)}
          </p>
        </div>

        {loading ? (
          <UsersLoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={handleRefresh} />
        ) : users.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <AdminUsersList
              users={users}
              currentUserId={currentUserId}
              onEdit={handleEditOpen}
              onDeactivate={setDeleteTarget}
            />

            <AdminUsersPaginationFooter
              meta={meta}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          </>
        )}
      </Card>

      <AdminEditUserModal
        editTarget={editTarget}
        editForm={editForm}
        editErrors={editErrors}
        isSaving={isSaving}
        roleOptions={EDIT_ROLE_OPTIONS}
        verificationOptions={VERIFICATION_OPTIONS}
        onClose={handleEditClose}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
      />

      <AdminDeactivateUserModal
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminUsersPage;

import React, { memo } from "react";
import { RefreshCcw, Search } from "lucide-react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";

const AdminUsersFilterBar = memo(
  ({
    search,
    roleFilter,
    statusFilter,
    roleOptions,
    statusOptions,
    onSearchChange,
    onRoleFilterChange,
    onStatusFilterChange,
    onRefresh,
  }) => (
    <Card className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.28)] sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.75fr_0.75fr_auto]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            aria-label="Search users"
            placeholder="Search by name or email"
            value={search}
            onChange={onSearchChange}
            className="pl-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
        </div>

        <Select
          aria-label="Filter by role"
          options={roleOptions}
          value={roleFilter}
          onChange={onRoleFilterChange}
        />

        <Select
          aria-label="Filter by active status"
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
        />

        <Button
          type="button"
          variant="outline"
          className="rounded-2xl border-emerald-200 text-green-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          onClick={onRefresh}
        >
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>
    </Card>
  ),
);

export default AdminUsersFilterBar;

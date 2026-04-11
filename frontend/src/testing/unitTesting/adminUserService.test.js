import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../utils/api";
import {
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
} from "../../features/admin/services/adminUserService";

vi.mock("../../utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("adminUserService unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listAdminUsers should fetch the backend admin user list with query params", async () => {
    const params = { page: 2, limit: 10, search: "anna", role: "foodbank" };
    const expected = { data: [{ _id: "u1" }], meta: { total: 1 } };
    api.get.mockResolvedValue({ data: expected });

    const result = await listAdminUsers(params);

    expect(api.get).toHaveBeenCalledWith("/user", { params });
    expect(result).toEqual(expected);
  });

  it("updateAdminUser should patch a user record", async () => {
    const payload = { role: "restaurant", isActive: true };
    const expected = { user: { _id: "u2", ...payload } };
    api.patch.mockResolvedValue({ data: expected });

    const result = await updateAdminUser("u2", payload);

    expect(api.patch).toHaveBeenCalledWith("/user/u2", payload);
    expect(result).toEqual(expected);
  });

  it("deactivateAdminUser should call the admin soft delete endpoint", async () => {
    const expected = { message: "User account deactivated successfully" };
    api.delete.mockResolvedValue({ data: expected });

    const result = await deactivateAdminUser("u3");

    expect(api.delete).toHaveBeenCalledWith("/user/u3");
    expect(result).toEqual(expected);
  });
});

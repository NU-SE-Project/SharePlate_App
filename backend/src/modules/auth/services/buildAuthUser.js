export function buildAuthUser(user) {
  const userObj = typeof user?.toObject === "function" ? user.toObject() : user;
  const id = userObj?._id?.toString?.() || userObj?.id || null;

  return {
    id,
    _id: userObj?._id || null,
    name: userObj?.name || "",
    email: userObj?.email || "",
    role: userObj?.role || "",
    emailVerified: Boolean(userObj?.emailVerified),
    address: userObj?.address || "",
    contactNumber: userObj?.contactNumber || "",
    location: userObj?.location || null,
    isActive: Boolean(userObj?.isActive),
    verificationStatus: userObj?.verificationStatus || "unverified",
  };
}

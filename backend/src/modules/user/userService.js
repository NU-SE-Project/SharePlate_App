import User from "./User.js";

export async function getMyProfile(userId) {
  const user = await User.findById(userId); // password not returned due to select:false
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
}

export async function updateMyProfile(userId, updates) {
  // Security: user must NOT change these fields from profile update
  delete updates.role;
  delete updates.email;
  delete updates.password;
  delete updates.isActive;

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return user;
}

export async function listUsers(query) {
  const { page = 1, limit = 10, role, search } = query;

  const filter = {};
  if (role) filter.role = role;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const p = Math.max(Number(page), 1);
  const l = Math.min(Math.max(Number(limit), 1), 50);

  const [data, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l),
    User.countDocuments(filter),
  ]);

  return {
    data,
    meta: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  };
}

export async function adminUpdateUser(userId, updates) {
  // Admin can update only safe fields
  const allowed = [
    "role",
    "isActive",
    "name",
    "address",
    "contactNumber",
    "location",
  ];
  const clean = {};
  for (const key of allowed) {
    if (key in updates) clean[key] = updates[key];
  }

  const user = await User.findByIdAndUpdate(userId, clean, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return user;
}

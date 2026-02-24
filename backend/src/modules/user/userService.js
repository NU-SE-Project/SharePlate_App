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

import { getMyProfile, updateMyProfile } from "./userService.js";

export async function me(req, res, next) {
  try {
    const user = await getMyProfile(req.user.userId);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await updateMyProfile(req.user.userId, req.validated.body);
    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    next(err);
  }
}

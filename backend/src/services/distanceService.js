import User from "../modules/user/User.js";

const DISTANCE_KM = process.env.DISTANCE_KM || 10;

export const getNearbyUsers = async ({ latitude, longitude, role }) => {
  const distanceInMeters = DISTANCE_KM * 1000;

    const users = await User.find({
    role,
    isActive: true,
    verificationStatus: "verified",
    location: {
        $near: {
        $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
        },
        $maxDistance: distanceInMeters,
        },
    },
    });
  return users;
};
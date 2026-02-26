import User from "../modules/user/User.js";

export const getNearbyUsers = async ({ latitude, longitude, role }) => {
  // EMERGENCY RELOAD: If for some reason variables aren't loaded, try to default safely
  const rawDistance = process.env.DISTANCE_KM;
  const distanceKm = parseFloat(rawDistance) || 10;
  const distanceInMeters = distanceKm * 1000;

  console.log("---------- NEARBY QUERY DIAGNOSTICS ----------");
  console.log("RAW DISTANCE_KM FROM ENV:", rawDistance);
  console.log("PARSED distanceKm:", distanceKm);
  console.log("FINAL distanceInMeters:", distanceInMeters);
  console.log("INPUT latitude:", latitude, "(type:", typeof latitude, ")");
  console.log("INPUT longitude:", longitude, "(type:", typeof longitude, ")");
  console.log("INPUT role:", role);
  console.log("----------------------------------------------");

  // Validate ALL query inputs for NaN before calling User.find
  if (isNaN(latitude) || isNaN(longitude) || isNaN(distanceInMeters)) {
    console.error("CRITICAL: One of the numeric query parameters is NaN!");
    throw new Error(`Invalid query parameters: lat=${latitude}, lng=${longitude}, dist=${distanceInMeters}`);
  }

  const query = {
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
  };

  console.log("EXECUTING QUERY:", JSON.stringify(query, null, 2));
  const users = await User.find(query);
  return users;
};

return users;
};

/**
 * Calculate estimating time and distance using an external map routing API (e.g., OSRM)
 * @param {Array} origin - [longitude, latitude]
 * @param {Array} destination - [longitude, latitude]
 * @returns {Object} { distance: number (meters), duration: number (seconds) }
 */
export const getRouteDetails = async (origin, destination) => {
  try {
    const MAP_URL = process.env.MAP_URL || "http://router.project-osrm.org/driving";
    const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
    const url = `${MAP_URL}/${coords}?overview=false`;


    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch route details from map service");
    }

    const data = await response.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error("No route found between these locations");
    }

    const route = data.routes[0];
    return {
      distanceKm: (route.distance / 1000).toFixed(2), // in km
      durationMins: Math.ceil(route.duration / 60) // in minutes
    };
  } catch (error) {
    console.error("Map route calculation error:", error.message);
    throw error;
  }
};
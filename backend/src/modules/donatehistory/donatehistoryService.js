import Request from "../donation/foodbank/Request.js";
import Acceptance from "../request/shop/Acceptance.js";
import FoodRequest from "../request/foodbank/FoodRequest.js";

// ─────────────────────────────────────────────
// FEATURE 1: Donation History
// ─────────────────────────────────────────────
export async function fetchDonationHistory(userId, role) {
  const matchStage = buildDonationMatchStage(userId, role);

  const pipeline = [
    { $match: matchStage },

    {
      $lookup: {
        from: "donations",
        localField: "food_id",
        foreignField: "_id",
        as: "donation",
      },
    },
    { $unwind: "$donation" },

    {
      $lookup: {
        from: "users",
        localField: "donation.restaurant_id",
        foreignField: "_id",
        as: "donor",
      },
    },
    { $unwind: "$donor" },

    {
      $lookup: {
        from: "users",
        localField: "foodBank_id",
        foreignField: "_id",
        as: "receiver",
      },
    },
    { $unwind: "$receiver" },

    {
      $project: {
        _id: 1,
        status: 1,
        requestedQuantity: 1,
        requestedAt: 1,
        approvedAt: 1,
        collectedAt: 1,
        rejectedAt: 1,
        notes: 1,

        food: {
          id: "$donation._id",
          name: "$donation.foodName",
          type: "$donation.foodType",
          description: "$donation.description",
          totalQuantity: "$donation.totalQuantity",
          remainingQuantity: "$donation.remainingQuantity",
          expiryTime: "$donation.expiryTime",
          imageUrl: "$donation.imageUrl",
          donationStatus: "$donation.status",
        },

        donor: {
          id: "$donor._id",
          name: "$donor.name",
          email: "$donor.email",
          address: "$donor.address",
          contactNumber: "$donor.contactNumber",
        },

        receiver: {
          id: "$receiver._id",
          name: "$receiver.name",
          email: "$receiver.email",
          address: "$receiver.address",
          contactNumber: "$receiver.contactNumber",
        },
      },
    },

    { $sort: { requestedAt: -1 } },
  ];

  return Request.aggregate(pipeline);
}

function buildDonationMatchStage(userId, role) {
  if (role === "admin") return {};
  if (role === "restaurant") return { restaurant_id: userId };
  if (role === "foodbank") return { foodBank_id: userId };
  return {};
}

// ─────────────────────────────────────────────
// FEATURE 2: Request History
// ─────────────────────────────────────────────
export async function fetchRequestHistory(userId, role) {
  // Restaurant has its own separate pipeline
  if (role === "restaurant") {
    return fetchRequestHistoryForRestaurant(userId);
  }

  const matchStage = buildRequestMatchStage(userId, role);

  const pipeline = [
    { $match: matchStage },

    // Join foodbank user
    {
      $lookup: {
        from: "users",
        localField: "foodbank_id",
        foreignField: "_id",
        as: "foodbank",
      },
    },
    { $unwind: "$foodbank" },

    // Join all acceptances for this food request
    {
      $lookup: {
        from: "acceptances",
        localField: "_id",
        foreignField: "request_id",
        as: "acceptances",
      },
    },

    // Join all accepting restaurants
    {
      $lookup: {
        from: "users",
        localField: "acceptances.restaurant_id",
        foreignField: "_id",
        as: "acceptingRestaurants",
      },
    },

    // Merge restaurant details into each acceptance
    {
      $addFields: {
        acceptances: {
          $map: {
            input: "$acceptances",
            as: "acc",
            in: {
              acceptanceId: "$$acc._id",
              acceptedQuantity: "$$acc.acceptedQuantity",
              acceptedAt: "$$acc.createdAt",
              restaurant: {
                $let: {
                  vars: {
                    rest: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$acceptingRestaurants",
                            as: "r",
                            cond: { $eq: ["$$r._id", "$$acc.restaurant_id"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    id: "$$rest._id",
                    name: "$$rest.name",
                    email: "$$rest.email",
                    address: "$$rest.address",
                    contactNumber: "$$rest.contactNumber",
                  },
                },
              },
            },
          },
        },
      },
    },

    // ✅ Only inclusion fields — acceptingRestaurants is simply omitted (auto-excluded)
    {
      $project: {
        _id: 1,
        foodName: 1,
        foodType: 1,
        requestedQuantity: 1,
        remainingQuantity: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,

        totalAcceptedQuantity: { $sum: "$acceptances.acceptedQuantity" },
        totalAcceptances: { $size: "$acceptances" },

        foodbank: {
          id: "$foodbank._id",
          name: "$foodbank.name",
          email: "$foodbank.email",
          address: "$foodbank.address",
          contactNumber: "$foodbank.contactNumber",
        },

        acceptances: 1,
      },
    },

    { $sort: { createdAt: -1 } },
  ];

  return FoodRequest.aggregate(pipeline);
}

function buildRequestMatchStage(userId, role) {
  if (role === "admin") return {};
  if (role === "foodbank") return { foodbank_id: userId };
  return {};
}

// Restaurant: show food requests they accepted + foodbank info
async function fetchRequestHistoryForRestaurant(restaurantId) {
  const pipeline = [
    { $match: { restaurant_id: restaurantId } },

    {
      $lookup: {
        from: "foodrequests",
        localField: "request_id",
        foreignField: "_id",
        as: "foodRequest",
      },
    },
    { $unwind: "$foodRequest" },

    {
      $lookup: {
        from: "users",
        localField: "foodRequest.foodbank_id",
        foreignField: "_id",
        as: "foodbank",
      },
    },
    { $unwind: "$foodbank" },

    {
      $project: {
        _id: 1,
        acceptedQuantity: 1,
        acceptedAt: "$createdAt",

        foodRequest: {
          id: "$foodRequest._id",
          foodName: "$foodRequest.foodName",
          foodType: "$foodRequest.foodType",
          requestedQuantity: "$foodRequest.requestedQuantity",
          remainingQuantity: "$foodRequest.remainingQuantity",
          status: "$foodRequest.status",
          createdAt: "$foodRequest.createdAt",
        },

        foodbank: {
          id: "$foodbank._id",
          name: "$foodbank.name",
          email: "$foodbank.email",
          address: "$foodbank.address",
          contactNumber: "$foodbank.contactNumber",
        },
      },
    },

    { $sort: { acceptedAt: -1 } },
  ];

  return Acceptance.aggregate(pipeline);
}


// ─────────────────────────────────────────────
// Get all donation history by a specific restaurant ID
// ─────────────────────────────────────────────
export async function fetchDonationHistoryByRestaurant(restaurantId) {
  const pipeline = [
    // Start from Request, match restaurant
    { $match: { restaurant_id: restaurantId } },

    // Join donation
    {
      $lookup: {
        from: "donations",
        localField: "food_id",
        foreignField: "_id",
        as: "donation",
      },
    },
    { $unwind: "$donation" },

    // Join donor (restaurant who created the donation)
    {
      $lookup: {
        from: "users",
        localField: "donation.restaurant_id",
        foreignField: "_id",
        as: "donor",
      },
    },
    { $unwind: "$donor" },

    // Join receiver (foodbank)
    {
      $lookup: {
        from: "users",
        localField: "foodBank_id",
        foreignField: "_id",
        as: "receiver",
      },
    },
    { $unwind: "$receiver" },

    {
      $project: {
        _id: 1,
        status: 1,
        requestedQuantity: 1,
        requestedAt: 1,
        approvedAt: 1,
        collectedAt: 1,
        rejectedAt: 1,
        notes: 1,

        food: {
          id: "$donation._id",
          name: "$donation.foodName",
          type: "$donation.foodType",
          description: "$donation.description",
          totalQuantity: "$donation.totalQuantity",
          remainingQuantity: "$donation.remainingQuantity",
          expiryTime: "$donation.expiryTime",
          imageUrl: "$donation.imageUrl",
          donationStatus: "$donation.status",
        },

        donor: {
          id: "$donor._id",
          name: "$donor.name",
          email: "$donor.email",
          address: "$donor.address",
          contactNumber: "$donor.contactNumber",
        },

        receiver: {
          id: "$receiver._id",
          name: "$receiver.name",
          email: "$receiver.email",
          address: "$receiver.address",
          contactNumber: "$receiver.contactNumber",
        },
      },
    },

    { $sort: { requestedAt: -1 } },
  ];

  return Request.aggregate(pipeline);
}

// ─────────────────────────────────────────────
// Get all request history by a specific foodbank ID
// ─────────────────────────────────────────────
export async function fetchRequestHistoryByFoodbank(foodbankId) {
  const pipeline = [
    // Start from FoodRequest, match foodbank
    { $match: { foodbank_id: foodbankId } },

    // Join foodbank info
    {
      $lookup: {
        from: "users",
        localField: "foodbank_id",
        foreignField: "_id",
        as: "foodbank",
      },
    },
    { $unwind: "$foodbank" },

    // Join all acceptances for this request
    {
      $lookup: {
        from: "acceptances",
        localField: "_id",
        foreignField: "request_id",
        as: "acceptances",
      },
    },

    // Join restaurant info for each acceptance
    {
      $lookup: {
        from: "users",
        localField: "acceptances.restaurant_id",
        foreignField: "_id",
        as: "acceptingRestaurants",
      },
    },

    // Merge restaurant details into each acceptance
    {
      $addFields: {
        acceptances: {
          $map: {
            input: "$acceptances",
            as: "acc",
            in: {
              acceptanceId: "$$acc._id",
              acceptedQuantity: "$$acc.acceptedQuantity",
              acceptedAt: "$$acc.createdAt",
              restaurant: {
                $let: {
                  vars: {
                    rest: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$acceptingRestaurants",
                            as: "r",
                            cond: { $eq: ["$$r._id", "$$acc.restaurant_id"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    id: "$$rest._id",
                    name: "$$rest.name",
                    email: "$$rest.email",
                    address: "$$rest.address",
                    contactNumber: "$$rest.contactNumber",
                  },
                },
              },
            },
          },
        },
      },
    },

    {
      $project: {
        _id: 1,
        foodName: 1,
        foodType: 1,
        requestedQuantity: 1,
        remainingQuantity: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,

        totalAcceptedQuantity: { $sum: "$acceptances.acceptedQuantity" },
        totalAcceptances: { $size: "$acceptances" },

        foodbank: {
          id: "$foodbank._id",
          name: "$foodbank.name",
          email: "$foodbank.email",
          address: "$foodbank.address",
          contactNumber: "$foodbank.contactNumber",
        },

        acceptances: 1,
        acceptingRestaurants: 0,
      },
    },

    { $sort: { createdAt: -1 } },
  ];

  return FoodRequest.aggregate(pipeline);
}
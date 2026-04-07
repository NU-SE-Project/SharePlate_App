import Donation from '../donation/shop/Donation.js';
import Request from '../donation/foodbank/Request.js';
import FoodRequest from '../request/foodbank/FoodRequest.js';
import Acceptance from '../request/shop/Acceptance.js';
import Notification from '../notification/Notification.js';
import User from '../user/User.js';

export const getRestaurantDashboardData = async (restaurantId) => {
    try {
        // Fetch restaurant profile
        const restaurant = await User.findById(restaurantId).select('name address contactNumber verificationStatus');

        const totalDonations = await Donation.countDocuments({ restaurant_id: restaurantId });
        
        const recentDonations = await Donation.find({ restaurant_id: restaurantId })
            .sort({ createdAt: -1 })
            .limit(5);

        // Fetch acceptances with populated request and foodbank info
        const acceptances = await Acceptance.find({ restaurant_id: restaurantId })
            .populate({
                path: 'request_id',
                populate: { path: 'foodbank_id', select: 'name address contactNumber' }
            })
            .sort({ createdAt: -1 });
        
        const activeRequests = acceptances.filter(acc => acc.request_id && acc.request_id.status === 'open').length;
        const approvedRequests = acceptances.filter(acc => acc.request_id && acc.request_id.status === 'fulfilled').length;
        const rejectedRequests = acceptances.filter(acc => acc.request_id && acc.request_id.status === 'closed').length; 
        
        const mealsCollectedItems = await Donation.find({ restaurant_id: restaurantId, status: 'closed' });
        const mealsCollected = mealsCollectedItems.reduce((acc, curr) => acc + (curr.totalQuantity - curr.remainingQuantity), 0);

        const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        const expiringDonations = await Donation.find({
            restaurant_id: restaurantId,
            status: 'available',
            expiryTime: { $lte: twoDaysFromNow, $gt: new Date() }
        });

        const vegCount = await Donation.countDocuments({ restaurant_id: restaurantId, foodType: 'veg' });
        const nonVegCount = await Donation.countDocuments({ restaurant_id: restaurantId, foodType: 'non-veg' });
        
        const requestStats = [
          { name: 'Pending', value: activeRequests },
          { name: 'Approved', value: approvedRequests },
          { name: 'Rejected', value: rejectedRequests },
          { name: 'Collected', value: mealsCollectedItems.length }
        ];

        const notifications = await Notification.find({ user_id: restaurantId, isRead: false }).sort({ createdAt: -1 }).limit(10);

        const recentRequests = acceptances.slice(0, 5); // These are acceptances, not just requests

        return {
            profile: restaurant,
            stats: {
               totalDonations,
               activeRequests,
               approvedRequests,
               rejectedRequests,
               mealsCollected
            },
            recentActivity: {
               donations: recentDonations,
               requests: recentRequests
            },
            alerts: expiringDonations,
            charts: {
               foodTypeDistribution: [
                  { name: 'Veg', value: vegCount },
                  { name: 'Non-veg', value: nonVegCount } 
               ],
               requestStatusDistribution: requestStats
            },
            notifications
        };
    } catch (error) {
        throw new Error("Error fetching dashboard data: " + error.message);
    }
};

function pickLocation(...values) {
    return values.find((value) => typeof value === 'string' && value.trim()) || 'Location unavailable';
}

function buildLandingActivityFeed({
    donations = [],
    donationRequests = [],
    foodRequests = [],
    acceptances = [],
}) {
    const donationItems = donations.map((donation) => ({
        id: `donation-${donation._id}`,
        kind: 'donation',
        status: donation.status === 'available' ? 'Live' : donation.status === 'expired' ? 'Expired' : 'Completed',
        title: `${donation.foodName} listed for pickup`,
        meta: `${donation.remainingQuantity} of ${donation.totalQuantity} portions still available`,
        location: pickLocation(donation.restaurant_id?.address, donation.restaurant_id?.name),
        timestamp: donation.updatedAt || donation.createdAt,
    }));

    const donationRequestItems = donationRequests.map((request) => {
        const requestStatusMap = {
            pending: 'Requested',
            approved: 'Matched',
            rejected: 'Declined',
            cancelled: 'Cancelled',
            collected: 'Completed',
        };

        return {
            id: `donation-request-${request._id}`,
            kind: 'donation-request',
            status: requestStatusMap[request.status] || 'Updated',
            title: `${request.food_id?.foodName || 'Donation'} request updated`,
            meta: `${request.requestedQuantity} portions requested by ${request.foodBank_id?.name || 'a food bank'}`,
            location: pickLocation(
                request.foodBank_id?.address,
                request.restaurant_id?.address,
                request.foodBank_id?.name,
            ),
            timestamp:
                request.collectedAt ||
                request.approvedAt ||
                request.rejectedAt ||
                request.updatedAt ||
                request.createdAt,
        };
    });

    const foodRequestItems = foodRequests.map((request) => ({
        id: `food-request-${request._id}`,
        kind: 'food-request',
        status: request.status === 'fulfilled' ? 'Matched' : request.status === 'closed' ? 'Closed' : 'Urgent',
        title: `${request.foodName} request posted`,
        meta: `${request.remainingQuantity} of ${request.requestedQuantity} portions still needed`,
        location: pickLocation(request.foodbank_id?.address, request.foodbank_id?.name),
        timestamp: request.updatedAt || request.createdAt,
    }));

    const acceptanceItems = acceptances.map((acceptance) => ({
        id: `acceptance-${acceptance._id}`,
        kind: 'acceptance',
        status:
            acceptance.status === 'delivered'
                ? 'Completed'
                : acceptance.status === 'expired'
                    ? 'Expired'
                    : 'Matched',
        title: `${acceptance.request_id?.foodName || 'Food request'} accepted`,
        meta: `${acceptance.acceptedQuantity} portions committed by ${acceptance.restaurant_id?.name || 'a restaurant'}`,
        location: pickLocation(acceptance.restaurant_id?.address, acceptance.restaurant_id?.name),
        timestamp: acceptance.updatedAt || acceptance.createdAt,
    }));

    return [
        ...donationItems,
        ...donationRequestItems,
        ...foodRequestItems,
        ...acceptanceItems,
    ]
        .filter((item) => item.timestamp)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 6);
}

export const getLandingOverviewData = async () => {
    const now = new Date();
    const liveDonationFilter = {
        status: 'available',
        remainingQuantity: { $gt: 0 },
        expiryTime: { $gt: now },
    };

    const [
        liveListings,
        liveDonorIds,
        openFoodRequestCount,
        recentDonations,
        recentDonationRequests,
        recentFoodRequests,
        recentAcceptances,
    ] = await Promise.all([
        Donation.countDocuments(liveDonationFilter),
        Donation.distinct('restaurant_id', liveDonationFilter),
        FoodRequest.countDocuments({ status: 'open', remainingQuantity: { $gt: 0 } }),
        Donation.find(liveDonationFilter)
            .populate('restaurant_id', 'name address')
            .sort({ updatedAt: -1 })
            .limit(6)
            .lean(),
        Request.find({})
            .populate('food_id', 'foodName')
            .populate('foodBank_id', 'name address')
            .populate('restaurant_id', 'name address')
            .sort({ updatedAt: -1 })
            .limit(6)
            .lean(),
        FoodRequest.find({})
            .populate('foodbank_id', 'name address')
            .sort({ updatedAt: -1 })
            .limit(6)
            .lean(),
        Acceptance.find({})
            .populate('request_id', 'foodName')
            .populate('restaurant_id', 'name address')
            .sort({ updatedAt: -1 })
            .limit(6)
            .lean(),
    ]);

    return {
        stats: {
            liveListings,
            activeDonors: liveDonorIds.length,
            openRequests: openFoodRequestCount,
        },
        activity: buildLandingActivityFeed({
            donations: recentDonations,
            donationRequests: recentDonationRequests,
            foodRequests: recentFoodRequests,
            acceptances: recentAcceptances,
        }),
        generatedAt: now.toISOString(),
    };
};

import Donation from '../donation/shop/Donation.js';
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

import Donation from '../donation/shop/Donation.js';
import FoodRequest from '../request/foodbank/FoodRequest.js';
import Acceptance from '../request/shop/Acceptance.js';
import Notification from '../notification/Notification.js';

export const getRestaurantDashboardData = async (restaurantId) => {
    try {
        const totalDonations = await Donation.countDocuments({ restaurant_id: restaurantId });
        
        const recentDonations = await Donation.find({ restaurant_id: restaurantId })
            .sort({ createdAt: -1 })
            .limit(5);

        const acceptances = await Acceptance.find({ restaurant_id: restaurantId }).populate('request_id');
        
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
          { name: 'Pending', value: activeRequests || 1 }, // Added || 1 for testing visualization
          { name: 'Approved', value: approvedRequests || 2 },
          { name: 'Rejected', value: rejectedRequests || 0 },
          { name: 'Collected', value: mealsCollectedItems.length || 3 }
        ];

        const notifications = await Notification.find({ user_id: restaurantId, isRead: false }).sort({ createdAt: -1 }).limit(10);

        const recentRequests = acceptances.slice(0, 5).map(acc => acc.request_id).filter(Boolean);

        return {
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
                  { name: 'Veg', value: vegCount || 4 }, // Add default visual numbers for testing
                  { name: 'Non-veg', value: nonVegCount || 6 } 
               ],
               requestStatusDistribution: requestStats
            },
            notifications
        };
    } catch (error) {
        throw new Error("Error fetching dashboard data: " + error.message);
    }
};

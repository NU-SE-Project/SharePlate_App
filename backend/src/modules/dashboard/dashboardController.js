import * as dashboardService from './dashboardService.js';

export const getLandingOverview = async (req, res) => {
    try {
        const data = await dashboardService.getLandingOverviewData();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRestaurantDashboard = async (req, res) => {
    try {
        const restaurantId = req.user._id || req.user.userId; // fallback to userId
        console.log("I am in DashBoard Controller :: My restaurant ID :: ", restaurantId);
        console.log("I am in DashBoard Controller :: My user :: ", req.user);

        const data = await dashboardService.getRestaurantDashboardData(restaurantId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

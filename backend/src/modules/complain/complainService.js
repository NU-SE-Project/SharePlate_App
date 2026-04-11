import Complaint from "./Complaint.js";
import User from "../user/User.js";

/**
 * Create a new complaint
 */
export async function createComplaint(complainerId, data) {
    const { complaineeId, subject, description } = data;

    const complainee = await User.findById(complaineeId);
    if (!complainee) {
        const err = new Error("Complainee (target user) not found");
        err.statusCode = 404;
        throw err;
    }

    const complaint = await Complaint.create({
        complainer: complainerId,
        complainee: complaineeId,
        subject,
        description,
    });

    return complaint;
}

/**
 * Get complaints made by the current user
 */
export async function getMyComplaints(userId) {
    return await Complaint.find({ complainer: userId })
        .populate("complainee", "name email role")
        .sort({ createdAt: -1 });
}

/**
 * Get all complaints (Admin only) with optional filters
 */
export async function getAllComplaints(filters = {}) {
    const query = {};

    if (filters.status) {
        query.status = filters.status;
    }

    // Filter by complainer role or complainee role
    // This requires populating first or using a more complex aggregation,
    // but for simplicity with typical volume, we can filter after population 
    // or use $lookup if using aggregation.
    // However, Mongoose allows filtering on nested fields if we use aggregation,
    // or we can just filter by IDs if we find users first.
    
    // Better approach: If role filters are provided, find those users first.
    if (filters.complainerRole || filters.complaineeRole) {
        const userQuery = {};
        if (filters.complainerRole) userQuery.role = filters.complainerRole;
        
        const users = await User.find(userQuery).select("_id role");
        const userIds = users.map(u => u._id);

        if (filters.complainerRole) {
            query.complainer = { $in: userIds };
        }
    }

    if (filters.complaineeRole) {
        const userQuery = { role: filters.complaineeRole };
        const users = await User.find(userQuery).select("_id role");
        const userIds = users.map(u => u._id);
        query.complainee = { $in: userIds };
    }

    return await Complaint.find(query)
        .populate("complainer", "name email role")
        .populate("complainee", "name email role")
        .sort({ status: 1, createdAt: -1 });
}

/**
 * Reply to a complaint (Admin only)
 */
export async function replyToComplaint(complaintId, reply) {
    const complaint = await Complaint.findByIdAndUpdate(
        complaintId,
        {
            adminReply: reply,
            status: "resolved",
        },
        { new: true, runValidators: true }
    );

    if (!complaint) {
        const err = new Error("Complaint not found");
        err.statusCode = 404;
        throw err;
    }

    return complaint;
}

/**
 * List potential complainees based on user role
 * If user is restaurant, they can complain about foodbanks
 * If user is foodbank, they can complain about restaurants
 */
export async function getComplaintTargets(userRole) {
    const targetRole = userRole === "restaurant" ? "foodbank" : "restaurant";

    return await User.find({ role: targetRole, isActive: true })
        .select("name email role address");
}

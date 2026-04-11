import Complaint from "./Complaint.js";
import User from "../user/User.js";
import { getMaxDistanceSetting } from "../../services/distanceService.js";

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
 * List potential complainees based on user role and distance radius
 * If user is restaurant, they can complain about foodbanks
 * If user is foodbank, they can complain about restaurants
 */
export async function getComplaintTargets(userId, userRole) {
    const targetRole = userRole === "restaurant" ? "foodbank" : "restaurant";

    // 1. Fetch current user to get their location
    const currentUser = await User.findById(userId).select("location");
    
    // 2. Fetch the max distance setting
    const maxDistanceKm = await getMaxDistanceSetting();
    const maxDistanceMeters = maxDistanceKm * 1000;

    const query = {
        role: targetRole,
        isActive: true
    };

    // 3. Apply spatial filter if current user has location
    if (currentUser?.location?.coordinates?.length === 2) {
        query.location = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: currentUser.location.coordinates
                },
                $maxDistance: maxDistanceMeters
            }
        };
    }

    return await User.find(query)
        .select("name email role address");
}

/**
 * Delete a complaint Permanently
 * Admins can delete anything
 * Users can only delete their own PENDING complaints
 */
export async function deleteComplaint(id, userId, userRole) {
    const complaint = await Complaint.findById(id);

    if (!complaint) {
        const err = new Error("Complaint not found");
        err.statusCode = 404;
        throw err;
    }

    // Role-based protection logic
    if (userRole !== "admin") {
        // 1. Check ownership
        if (complaint.complainer.toString() !== userId) {
            const err = new Error("You are not authorized to delete this complaint");
            err.statusCode = 403;
            throw err;
        }

        // 2. Check status (can only delete if pending)
        if (complaint.status !== "pending") {
            const err = new Error("Cannot delete a complaint that has already been resolved by Admin");
            err.statusCode = 400;
            throw err;
        }
    }

    await Complaint.findByIdAndDelete(id);
    return complaint;
}

/**
 * Update an existing complaint
 * Users can only update their own PENDING complaints
 */
export async function updateComplaint(id, userId, userRole, data) {
    const complaint = await Complaint.findById(id);

    if (!complaint) {
        const err = new Error("Complaint not found");
        err.statusCode = 404;
        throw err;
    }

    // Role-based protection logic
    if (userRole !== "admin") {
        // 1. Check ownership
        if (complaint.complainer.toString() !== userId) {
            const err = new Error("You are not authorized to edit this complaint");
            err.statusCode = 403;
            throw err;
        }

        // 2. Check status (can only edit if pending)
        if (complaint.status !== "pending") {
            const err = new Error("Cannot edit a complaint that has already been resolved by Admin");
            err.statusCode = 400;
            throw err;
        }
    }

    // Update allowed fields
    if (data.subject) complaint.subject = data.subject;
    if (data.description) complaint.description = data.description;
    if (data.complaineeId) complaint.complainee = data.complaineeId;

    await complaint.save();
    return complaint;
}

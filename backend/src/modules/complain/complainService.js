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
 * Get all complaints (Admin only)
 */
export async function getAllComplaints() {
    return await Complaint.find()
        .populate("complainer", "name email role")
        .populate("complainee", "name email role")
        .sort({ createdAt: -1 });
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

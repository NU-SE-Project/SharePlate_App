import * as complainService from "./complainService.js";

/**
 * Handle POST /api/complaints
 */
export async function createComplaint(req, res, next) {
    try {
        const complaint = await complainService.createComplaint(
            req.user.userId,
            req.body
        );
        res.status(201).json({
            message: "Complaint submitted successfully",
            complaint,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Handle GET /api/complaints/my
 */
export async function getMyComplaints(req, res, next) {
    try {
        const complaints = await complainService.getMyComplaints(req.user.userId);
        res.status(200).json(complaints);
    } catch (err) {
        next(err);
    }
}

/**
 * Handle GET /api/complaints/targets
 */
export async function getComplaintTargets(req, res, next) {
    try {
        const targets = await complainService.getComplaintTargets(
            req.user.userId,
            req.user.role
        );
        res.status(200).json(targets);
    } catch (err) {
        next(err);
    }
}

/**
 * Handle GET /api/complaints
 */
export async function getAllComplaints(req, res, next) {
    try {
        const { status, complainerRole, complaineeRole } = req.query;
        const complaints = await complainService.getAllComplaints({
            status,
            complainerRole,
            complaineeRole,
        });
        res.status(200).json(complaints);
    } catch (err) {
        next(err);
    }
}

/**
 * Handle PATCH /api/complaints/:id/reply
 */
export async function replyToComplaint(req, res, next) {
    try {
        const { adminReply } = req.body;
        if (!adminReply) {
            const err = new Error("Reply content is required");
            err.statusCode = 400;
            throw err;
        }

        const complaint = await complainService.replyToComplaint(
            req.params.id,
            adminReply
        );
        res.status(200).json({
            message: "Complaint replied and resolved",
            complaint,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Handle DELETE /api/complaints/:id
 */
export async function deleteComplaint(req, res, next) {
    try {
        await complainService.deleteComplaint(
            req.params.id,
            req.user.userId,
            req.user.role
        );
        res.status(200).json({ message: "Complaint deleted successfully" });
    } catch (err) {
        next(err);
    }
}

/**
 * Handle PATCH /api/complaints/:id
 */
export async function updateComplaint(req, res, next) {
    try {
        const complaint = await complainService.updateComplaint(
            req.params.id,
            req.user.userId,
            req.user.role,
            req.body
        );
        res.status(200).json({
            message: "Complaint updated successfully",
            complaint,
        });
    } catch (err) {
        next(err);
    }
}

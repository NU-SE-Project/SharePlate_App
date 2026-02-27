import { Schema, model } from "mongoose";

const complaintSchema = new Schema(
    {
        complainer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        complainee: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        adminReply: {
            type: String,
            default: null,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "resolved"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default model("Complaint", complaintSchema);

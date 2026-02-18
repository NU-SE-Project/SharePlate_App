import { Schema, model } from "mongoose";

const donationSchema = new Schema(
  {
    restaurant_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    foodType: {
      type: String,
    },

    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    remainingQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    expiryTime: {
      type: Date,
      required: true,
    },

    pickupWindowStart: {
      type: Date,
      required: true,
    },

    pickupWindowEnd: {
      type: Date,
      required: true,
    },

    imageUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["available", "closed", "expired"],
      default: "available",
    },
  },
  { timestamps: true }
);

donationSchema.index({ expiryTime: 1 });
donationSchema.index({ status: 1 });

donationSchema.pre("save", function (next) {
  // if (this.pickupWindowEnd <= this.pickupWindowStart) {
  //   return next(new Error("Pickup end time must be after start time"));
  // }

  // if (this.expiryTime <= new Date()) {
  //   return next(new Error("Expiry time must be in the future"));
  // }

  // if (this.pickupWindowEnd > this.expiryTime) {
  //   return next(
  //     new Error("Pickup window must end before expiry time")
  //   );
  // }

  // next();

   if (this.pickupWindowEnd <= this.pickupWindowStart) {
    throw new Error("Pickup end time must be after start time");
  }

  if (this.expiryTime <= new Date()) {
    throw new Error("Expiry time must be in the future");
  }

  if (this.pickupWindowEnd > this.expiryTime) {
    throw new Error("Pickup window must end before expiry time");
  }
});

export default model("Donation", donationSchema);

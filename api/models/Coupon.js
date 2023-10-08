import mongoose, { SchemaTypes } from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    discount: {
      type: Number,
      required: true
    },
    clientId: {
      type: SchemaTypes.ObjectId,
      ref: 'Client',
      required: true
    },
    validFrom: {
      type: Date,
      required: true
    },
    validTo: {
      type: Date,
      required: true
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", CouponSchema);
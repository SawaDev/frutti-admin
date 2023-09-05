import mongoose, { SchemaTypes } from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: Number,
      unique: true,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [{
      type: SchemaTypes.ObjectId,
      ref: 'Transaction'
    }]
  },
  { timestamps: true }
);

export default mongoose.model("Card", CardSchema);
import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      required: true,
    },
    actionDetails: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.model("History", HistorySchema);
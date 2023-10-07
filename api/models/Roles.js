import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    admin: [String],
    creator: [String],
    worker: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);
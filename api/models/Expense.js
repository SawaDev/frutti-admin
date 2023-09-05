import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Expense", ExpenseSchema);
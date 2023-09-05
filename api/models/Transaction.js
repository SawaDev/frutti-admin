import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"], // "credit" for money received, "debit" for money spent
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card"
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", TransactionSchema);
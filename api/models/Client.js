import mongoose, { SchemaTypes } from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    cash: {
      type: Number,
      default: 0,
    },
    // tgUsername: {
    //   type: String,
    //   required: true,
    // },
    // chatId: {
    //   type: String,
    // },
    sales: [{
      type: SchemaTypes.ObjectId,
      ref: 'Sale'
    }]
  }, { timestamps: true }
)

export default mongoose.model("Client", ClientSchema);
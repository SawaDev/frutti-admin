import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    tanNarxi: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    soni: {
      type: Number,
      required: true,
      min: 0
    },
    img: {
      type: String,
    },
    desc: {
      type: String,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
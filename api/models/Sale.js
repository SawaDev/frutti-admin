import mongoose, { SchemaTypes } from "mongoose";

const ProductSalesSchema = new mongoose.Schema(
  {
    clientId: {
      type: SchemaTypes.ObjectId,
      ref: 'Client',
    },
    products: [{
      productId: {
        type: SchemaTypes.ObjectId,
        ref: 'Product',
        required: true
      },
      ketdi: {
        type: Number,
        default: 0,
        min: 0,
      },
      keldi: {
        type: Number,
        default: 0,
        min: 0,
      },
      priceOfProduct: {
        type: Number,
        min: 0
      }
    }],
    payment: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      default: 'Kutilmoqda'
    },
    amount: {
      type: Number,
    },
    discount: {
      type: Boolean,
      default: false,
    },
    discountPercent: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Sale", ProductSalesSchema);
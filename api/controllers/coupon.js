import mongoose from "mongoose";
import Client from "../models/Client.js";
import Coupon from "../models/Coupon.js";
import Sale from "../models/Sale.js";

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = new Coupon(req.body);
    const savedCoupon = await coupon.save();

    const client = await Client.findOne({ _id: new mongoose.Types.ObjectId(req.body.clientId), })

    const sales = await Sale.find(
      {
        clientId: new mongoose.Types.ObjectId(req.body.clientId),
        createdAt: {
          $gte: new Date(savedCoupon.validFrom), $lt: new Date(savedCoupon.validTo)  //mm-dd-yyyy
        }
      }
    )

    let currentCash = client.cash
    let summa = 0;
    let summaWithDiscount = 0;

    for (const sale of sales) {
      sale.couponId = savedCoupon._id
      sale.discountPercent = savedCoupon.discount

      summa += sale.amount
      summaWithDiscount += sale.amount * (1 - (sale.discountPercent / 100))

      await sale.save();
    }

    client.cash = currentCash + summa - summaWithDiscount
    await client.save();

    res.status(201).json(savedCoupon);
  } catch (error) {
    next(error);
  }
};
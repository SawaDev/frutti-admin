import Sale from "../models/Sale.js";
import Client from "../models/Client.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";

export const createClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ name: req.body.name })
    if (client) return next(createError(403, "Bu ismli xaridor mavjud!"));

    const newClient = new Client(req.body);
    await newClient.save();

    res.status(200).json(newClient);
  } catch (err) {
    next(err);
  }
}

export const updateClient = async (req, res, next) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedClient);
  } catch (err) {
    next(err);
  }
}

export const deleteClient = async (req, res, next) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.status(200).json("Client has been deleted.");
  } catch (err) {
    next(err);
  }
}

export const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    res.status(200).json(client);
  } catch (err) {
    next(err);
  }
}

export const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (err) {
    next(err);
  }
}

export const getMontlySalesOfClients = async (req, res, next) => {
  try {
    const { id, filter } = req.query;

    const date = new Date();
    const lastYear = new Date(new Date().setFullYear(date.getFullYear() - 1));

    const match = {}
    match.createdAt = { $gte: lastYear }

    if (id !== 'null') {
      match.clientId = new mongoose.Types.ObjectId(id);
    } else {
      match.clientId = { $exists: true }
    }

    const aggregationByMonth = [
      {
        $match: match,
      },
      {
        $unwind: "$products"
      },
      {
        $project: {
          _id: 1,
          productId: "$products.productId",
          cost: { $multiply: ["$products.ketdi", "$products.priceOfProduct"] },
          ketdi: "$products.ketdi",
          status: "$status",
          products: 1,
          createdAt: 1,
          month: { $month: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $group: {
          _id: {
            productId: "$productId",
            month: "$month",
          },
          monthlyKetdi: { $sum: "$ketdi" },
          monthlyCost: { $sum: "$cost" },
          product: {
            $first: "$product"
          }
        },
      },
      {
        $project: {
          _id: "$_id.month",
          productId: "$_id.productId",
          monthlyKetdi: 1,
          monthlyCost: 1,
          product: 1
        }
      },
      {
        $group: {
          _id: "$_id",
          products: {
            $push: "$$ROOT"
          }
        }
      },
      {
        $project: {
          _id: 1,
          summa: { $sum: "$products.monthlyCost" },
          sumSoni: { $sum: "$products.monthlyKetdi" },
          products: 1,
        }
      }
    ]

    const aggregationByHalfOfMonth = [
      {
        $match: match,
      },
      {
        $addFields: {
          startMonth: {
            $cond: [
              { $gte: [{ $dayOfMonth: "$createdAt" }, 15] },
              { $month: "$createdAt" },
              {
                $cond: [
                  { $eq: [{ $month: "$createdAt" }, 1] },
                  12,
                  { $add: [{ $month: "$createdAt" }, -1] }
                ]
              }
            ]
          },
          startYear: {
            $cond: [
              { $gte: [{ $dayOfMonth: "$createdAt" }, 15] },
              { $year: "$createdAt" },
              {
                $cond: [
                  { $eq: [{ $month: "$createdAt" }, 1] },
                  { $add: [{ $year: "$createdAt" }, -1] },
                  { $year: "$createdAt" }
                ]
              }
            ]
          }
        }
      },
      {
        $addFields: {
          nextMonth: {
            $cond: [
              { $lt: [{ $dayOfMonth: "$createdAt" }, 15] },
              { $month: "$createdAt" },
              {
                $cond: [
                  { $eq: [{ $month: "$createdAt" }, 12] },
                  1,
                  { $add: [{ $month: "$createdAt" }, 1] }
                ]
              }
            ]
          },
          nextYear: {
            $cond: [
              { $lt: [{ $dayOfMonth: "$createdAt" }, 15] },
              { $year: "$createdAt" },
              {
                $cond: [
                  { $eq: [{ $month: "$createdAt" }, 12] },
                  { $add: [{ $year: "$createdAt" }, 1] },
                  { $year: "$createdAt" },
                ]
              }
            ]
          }
        }
      },
      {
        $addFields: {
          startDate: {
            $dateFromParts: {
              year: "$startYear",
              month: "$startMonth",
              day: 15
            }
          },
          endDate: {
            $dateFromParts: {
              year: "$nextYear",
              month: "$nextMonth",
              day: 15
            }
          }
        }
      },
      {
        $unwind: "$products"
      },
      {
        $project: {
          _id: 1,
          clientId: 1,
          productId: "$products.productId",
          cost: { $multiply: ["$products.ketdi", "$products.priceOfProduct"] },
          ketdi: "$products.ketdi",
          startDate: 1,
          endDate: 1,
          startMonth: 1,
          nextMonth: 1,
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $group: {
          _id: {
            productId: "$productId",
            startDate: "$startDate",
            endDate: "$endDate",
            startMonth: "$startMonth",
            nextMonth: "$nextMonth"
          },
          monthlyKetdi: { $sum: "$ketdi" },
          monthlyCost: { $sum: "$cost" },
          product: {
            $first: "$product"
          }
        },
      },
      {
        $project: {
          _id: {
            startDate: "$_id.startDate",
            endDate: "$_id.endDate",
            startMonth: "$_id.startMonth",
            nextMonth: "$_id.nextMonth"
          },
          productId: "$_id.productId",
          monthlyKetdi: 1,
          monthlyCost: 1,
          product: 1,
        }
      },
      {
        $group: {
          _id: {
            startDate: "$_id.startDate",
            endDate: "$_id.endDate",
            startMonth: "$_id.startMonth",
            nextMonth: "$_id.nextMonth"
          },
          products: {
            $push: "$$ROOT"
          },
        }
      },
      {
        $project: {
          _id: 1,
          summa: { $sum: "$products.monthlyCost" },
          sumSoni: { $sum: "$products.monthlyKetdi" },
          products: 1,
        }
      }
    ]

    const data = await Sale.aggregate(filter === "byMonth" ? aggregationByMonth : aggregationByHalfOfMonth)

    const statAggregationByMonth = [
      {
        $match: match
      },
      {
        $project: {
          _id: 1,
          payment: "$payment",
          month: { $month: "$createdAt" }
        }
      },
      {
        $group: {
          _id: "$month",
          payment: { $sum: "$payment" },
        }
      }
    ]

    const statAggregationByHalfMonth = [
      {
        $match: match
      },
      {
        $addFields: {
          startMonth: {
            $cond: [
              { $gte: [{ $dayOfMonth: "$createdAt" }, 15] },
              { $month: "$createdAt" },
              {
                $cond: [
                  { $eq: [{ $month: "$createdAt" }, 1] },
                  12,
                  { $add: [{ $month: "$createdAt" }, -1] }
                ]
              }
            ]
          },
          startYear: {
            $cond: [
              { $gte: [{ $dayOfMonth: "$createdAt" }, 15] },
              { $year: "$createdAt" },
              {
                $cond: [
                  { $eq: [{ $month: "$createdAt" }, 1] },
                  { $add: [{ $year: "$createdAt" }, -1] },
                  { $year: "$createdAt" }
                ]
              }
            ]
          }
        }
      },
      {
        $addFields: {
          nextMonth: {
            $cond: [
              { $lt: [{ $dayOfMonth: "$createdAt" }, 15] },
              { $month: "$createdAt" },
              {
                $cond: [
                  { $eq: [{ $month: "$createdAt" }, 12] },
                  1,
                  { $add: [{ $month: "$createdAt" }, 1] }
                ]
              }
            ]
          },
          nextYear: {
            $cond: [
              { $lt: [{ $dayOfMonth: "$createdAt" }, 15] },
              { $year: "$createdAt" },
              {
                $cond: [
                  { $eq: [{ $month: "$createdAt" }, 12] },
                  { $add: [{ $year: "$createdAt" }, 1] },
                  { $year: "$createdAt" },
                ]
              }
            ]
          }
        }
      },
      {
        $addFields: {
          startDate: {
            $dateFromParts: {
              year: "$startYear",
              month: "$startMonth",
              day: 15
            }
          },
          endDate: {
            $dateFromParts: {
              year: "$nextYear",
              month: "$nextMonth",
              day: 15
            }
          }
        }
      },
      {
        $project: {
          payment: "$payment",
          startDate: "$startDate",
          endDate: "$endDate",
        }
      },
      {
        $group: {
          _id: {
            startDate: "$startDate",
            endDate: "$endDate"
          },
          payment: { $sum: "$payment" },
        }
      }
    ]

    const stat = await Sale.aggregate(filter === "byMonth" ? statAggregationByMonth : statAggregationByHalfMonth)

    const mergedData = data.map((d) => {
      if (filter === "byMonth") {
        const paymentObject = stat.find(s => s._id === d._id);
        if (paymentObject) {
          return { ...d, payment: paymentObject.payment }
        }
        return d;
      }
      if (filter === "byHalfMonth") {
        const paymentObject = stat.find(s => s._id.startDate.toISOString() === d._id.startDate.toISOString());
        if (paymentObject) {
          return { ...d, payment: paymentObject.payment }
        }
        return d;
      }
    })

    res.status(200).json(
      filter === "byMonth" ?
        mergedData :
        mergedData.sort((a, b) => b._id.startMonth - a._id.startMonth)
    )
  } catch (err) {
    next(err);
  }
}
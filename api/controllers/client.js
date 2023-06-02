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
    const { id, productId } = req.query;

    const date = new Date();
    const lastYear = new Date(new Date().setFullYear(date.getFullYear() - 1));

    const match = {}
    match.createdAt = { $gte: lastYear }

    if (id !== 'null') {
      match.clientId = new mongoose.Types.ObjectId(id);
    } else {
      match.clientId = { $exists: true }
    }

    const data = await Sale.aggregate([
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
    ])

    const stat = await Sale.aggregate([
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
    ])

    const mergedData = data.map((d) => {
      const paymentObject = stat.find(s => s._id === d._id);
      if (paymentObject) {
        return { ...d, payment: paymentObject.payment }
      }

      return d;
    })

    res.status(200).json(mergedData)
  } catch (err) {
    next(err);
  }
}
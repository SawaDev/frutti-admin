import Sale from "../models/Sale.js"
import Product from "../models/Product.js"
import Client from "../models/Client.js"
import mongoose from "mongoose";

export const newCollection = async (req, res, next) => {
  try {
    const { products } = req.body;

    for (const product of products) {
      await Product.updateOne(
        { _id: product.productId },
        { $inc: { soni: product.keldi } }
      );
    }

    const newSale = new Sale({
      products
    })

    await newSale.save();

    res.status(200).send(newSale);
  } catch (err) {
    next(err);
  }
}

export const getSales = async (req, res, next) => {
  try {
    const { date, clientId } = req.query

    const match = {}
    if (date !== '') {
      match.createdAtDate = date;
    }

    if (clientId !== 'null') {
      match.clientId = new mongoose.Types.ObjectId(clientId);
    }

    const sales = await Sale.aggregate([
      {
        $addFields: {
          createdAtDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        }
      },
      {
        $match: match,
      },
      {
        $unwind: "$products"
      },
      {
        $project: {
          _id: 1,
          clientId: 1,
          ketdi: "$products.ketdi",
          priceOfProduct: "$products.priceOfProduct",
          status: "$status",
          payment: "$payment",
          products: 1,
          createdAtDate: 1
        }
      },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client"
        }
      },
      {
        $unwind: "$client"
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "products"
        }
      },
      {
        $project: {
          _id: 1,
          ketdi: 1,
          priceOfProduct: 1,
          products: 1,
          createdAtDate: 1,
          payment: 1,
          status: 1,
          clientName: "$client.name"
        }
      },
      {
        $unwind: "$products"
      },
      {
        $addFields: {
          "products.ketdi": "$ketdi",
          "products.priceOfProduct": "$priceOfProduct",
        }
      },
      {
        $addFields: {
          summa: {
            $multiply: ["$products.ketdi", "$products.priceOfProduct"]
          },
        }
      },
      {
        $group: {
          _id: "$_id",
          products: {
            $addToSet: "$products"
          },
          payment: {
            $first: "$payment"
          },
          status: {
            $first: "$status"
          },
          createdAtDate: {
            $first: "$createdAtDate"
          },
          clientName: {
            $first: "$clientName"
          },
          summa: {
            $sum: "$summa"
          },
          sumSoni: {
            $sum: "$products.ketdi"
          }
        }
      },
      {
        $group: {
          _id: "$createdAtDate",
          sales: {
            $push: "$$ROOT"
          }
        }
      },
      {
        $project: {
          _id: 0,
          createdAtDate: "$_id",
          sales: 1
        }
      },
      {
        $sort: { createdAtDate: -1 }
      }
    ]);

    res.json(sales);
  } catch (err) {
    next(err);
  }
}

export const getSalesByClient = async (req, res, next) => {
  const clientId = req.params.clientId;
  const day = req.query.day;

  try {
    const sales = await Sale.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(clientId),
          $expr: {
            $cond: {
              if: { $eq: [day, ''] },
              then: true,
              else: { $eq: [{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, day] }

            }
          },
        }
      },
      {
        $unwind: "$products"
      },
      {
        $project: {
          _id: 1,
          ketdi: "$products.ketdi",
          status: "$status",
          payment: "$payment",
          products: 1,
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "products"
        }
      },
      {
        $project: {
          _id: 1,
          ketdi: 1,
          products: 1,
          createdAt: 1,
          payment: 1,
          status: 1
        }
      },
      {
        $unwind: "$products"
      },
      {
        $addFields: {
          "products.ketdi": "$ketdi"
        }
      },
      {
        $group: {
          _id: "$_id",
          products: {
            $addToSet: "$products"
          },
          payment: {
            $first: "$payment"
          },
          status: {
            $first: "$status"
          },
          createdAt: {
            $first: "$createdAt"
          }
        }
      },
      {
        $group: {
          _id: "$createdAt",
          sales: {
            $push: "$$ROOT"
          }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    res.json(sales);
  } catch (err) {
    next(err);
  }
}

export const dailySales = async (req, res, next) => {
  const id = req.params.id;
  const startDate = req.query.start;
  const endDate = req.query.end;

  try {
    //Aggregation array without sum of all values
    const aggregationArray = [
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }
      },
      {
        $unwind: "$products"
      },
      {
        $match: {
          "products.productId": new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $addFields: {
          "products.cost": {
            $multiply: ["$products.ketdi", "$products.priceOfProduct"]
          },
          "products.profit": {
            $sum: {
              $cond: [
                { $eq: ["$products.priceOfProduct", null] },
                { $multiply: ["$product.tanNarxi", "$products.ketdi"] },
                {
                  $subtract: [
                    { $multiply: ["$products.priceOfProduct", "$products.ketdi"] },
                    { $multiply: ["$product.tanNarxi", "$products.ketdi"] },
                  ]
                }
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalKeldi: { $sum: "$products.keldi" },
          totalKetdi: { $sum: "$products.ketdi" },
          totalCost: { $sum: "$products.cost" },
          totalProfit: { $sum: "$products.profit" },
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]

    const newArray = [
      {
        $group: {
          _id: null,
          totalKeldi: { $sum: "$totalKeldi" },
          totalKetdi: { $sum: "$totalKetdi" },
          totalCost: { $sum: "$totalCost" },
          totalProfit: { $sum: "$totalProfit" },
        }
      },
    ]

    const sales = await Sale.aggregate(aggregationArray);
    const salesAllSummed = await Sale.aggregate(aggregationArray.concat(newArray));

    const newObject = {
      sales,
      salesAllSummed: salesAllSummed[0]
    }
    res.status(200).json(newObject);
  } catch (err) {
    next(err);
  }
}

export const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);

    await Client.findByIdAndUpdate(
      sale.clientId,
      { $pull: { sales: sale._id } },
      { new: true }
    )

    await Sale.findByIdAndDelete(req.params.id)

    res.status(200).json("O'chirildi");
  } catch (err) {
    next(err);
  }
}

export const getMontlySalesOfClients = async (req, res, next) => {
  try {
    const id = req.query.id;
    const date = new Date();
    const lastYear = new Date(new Date().setFullYear(date.getFullYear() - 1));

    const data = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: lastYear },
          $expr: {
            $cond: {
              if: { $eq: [id, ''] },
              then: true,
              else: { $eq: ["$clientId", new mongoose.Types.ObjectId(id)] }
            }
          },
        }
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
    ])

    res.status(200).json(data)
  } catch (err) {
    next(err);
  }
}
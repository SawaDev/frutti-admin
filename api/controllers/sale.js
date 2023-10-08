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
    const { date, endDate, clientId, type } = req.query

    const match = {}

    if (date !== '' && endDate !== '') {
      match.createdAtDate = { $gte: date, $lte: endDate };
    } else if (endDate !== '') {
      match.createdAtDate = { $lte: endDate };
    } else if (date !== '') {
      match.createdAtDate = { $gte: date };
    }

    if (clientId !== 'null') {
      match.clientId = new mongoose.Types.ObjectId(clientId);
    }

    const notGroupedAggr = [
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
          createdAtDate: 1,
          createdAt: 1,
          discountPercent: 1,
          couponId: 1,
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
          from: "coupons",
          localField: "couponId",
          foreignField: "_id",
          as: "coupon"
        }
      },
      {
        $unwind: {
          path: "$coupon",
          preserveNullAndEmptyArrays: true // Preserve documents without a coupon
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$$ROOT", // Preserve all original fields
              {
                coupon: "$coupon" // Include the coupon field in the output
              }
            ]
          }
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
          priceOfProduct: 1,
          products: 1,
          createdAtDate: 1,
          createdAt: 1,
          payment: 1,
          status: 1,
          client: 1,
          coupon: 1,
          discountPercent: 1,
        }
      },
      {
        $unwind: "$products"
      },
      {
        $addFields: {
          "products.ketdi": "$ketdi",
          "products.priceOfProduct": "$priceOfProduct",
          "products.discount": "$discountPercent",
        }
      },
      {
        $addFields: {
          summaWithDiscount: {
            $cond: [
              { $eq: ["$products.discount", null] },
              {
                $multiply: ["$products.ketdi", "$products.priceOfProduct"]
              },
              {
                $subtract: [
                  {
                    $multiply: ["$products.ketdi", "$products.priceOfProduct"]
                  },
                  {
                    $multiply: [
                      "$products.ketdi",
                      "$products.priceOfProduct",
                      {
                        $divide: ["$products.discount", 100]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          summaWithoutDiscount: {
            $multiply: ["$products.ketdi", "$products.priceOfProduct"]
          }
        },
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
          createdAt: {
            $first: "$createdAt"
          },
          client: {
            $first: "$client"
          },
          summa: {
            $sum: "$summaWithoutDiscount"
          },
          summaWithDiscount: {
            $sum: "$summaWithDiscount"
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
          },
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
    ]

    const groupedAggr = [
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
        $lookup: {
          from: "coupons",
          localField: "couponId",
          foreignField: "_id",
          as: "coupon"
        }
      },
      {
        $unwind: "$coupon"
      },
      {
        $group: {
          _id: {
            createdAtDate: "$createdAtDate",
            productId: "$products.productId",
            clientId: "$clientId",
          },
          ketdi: {
            $sum: "$products.ketdi"
          },
          summa: {
            $sum: {
              $multiply: ['$products.ketdi', '$products.priceOfProduct']
            }
          },
          summaWithDiscount: {
            $sum: {
              $subtract: [
                {
                  $multiply: ["$products.ketdi", "$products.priceOfProduct"]
                },
                {
                  $multiply: [
                    "$products.ketdi",
                    "$products.priceOfProduct",
                    {
                      $divide: ["$coupon.discount", 100]
                    }
                  ]
                }
              ]
            },
          },
          payment: {
            $first: "$payment"
          }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.productId",
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
            createdAtDate: "$_id.createdAtDate",
            clientId: "$_id.clientId"
          },
          sumKetdi: {
            $sum: "$ketdi"
          },
          overallSumma: {
            $sum: "$summa"
          },
          summaWithDiscount: {
            $sum: "$summaWithDiscount"
          },
          products: {
            $push: "$$ROOT"
          },
          payment: {
            $first: "$payment"
          }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id.clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: "$client" },
      {
        $group: {
          _id: "$_id.createdAtDate",
          sumKetdi: {
            $sum: "$sumKetdi"
          },
          summa: {
            $sum: "$overallSumma"
          },
          summaWithDiscount: {
            $sum: "$summaWithDiscount"
          },
          clients: {
            $push: "$$ROOT"
          }
        }
      },
      {
        $addFields: {
          createdAtDate: "$_id"
        }
      },
      { $sort: { createdAtDate: -1 } },
    ]

    const aggr = type === "notgrouped" ? notGroupedAggr : groupedAggr

    const sales = await Sale.aggregate(aggr);

    if (type === "notgrouped") {
      const clientSalesSum = {}
      sales.forEach((date) => {
        date.sales.sort((a, b) => b.createdAt - a.createdAt).forEach((sale) => {
          const client = sale.client;
          const payment = sale.payment;
          const summa = sale.summa;
          const summaWithDiscount = sale.summaWithDiscount;

          if (!clientSalesSum.hasOwnProperty(client._id)) {
            clientSalesSum[client._id] = client.cash;
          }

          const cashAfter = clientSalesSum[client._id]
          clientSalesSum[client._id] = cashAfter - payment + (summaWithDiscount ?? summa);
          const cashBefore = clientSalesSum[client._id]

          sale.cashAfter = cashAfter;
          sale.cashBefore = cashBefore;
        })
      })
    }

    res.json(sales);
  } catch (err) {
    next(err);
  }
}

export const getSalesByClient = async (req, res, next) => {
  const clientId = req.params.clientId;

  const client = await Client.findById(clientId);

  const { startDay, endDay } = req.query;

  // aggregation for getting sales by client in each day
  const aggr = [
    {
      $match: {
        clientId: new mongoose.Types.ObjectId(clientId),
        $and: [
          {
            $expr: {
              $cond: {
                if: { $eq: [startDay, ''] },
                then: true,
                else: { $gte: [{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, startDay] }
              }
            },
          },
          {
            $expr: {
              $cond: {
                if: { $eq: [endDay, ''] },
                then: true,
                else: { $lte: [{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, endDay] }
              }
            },
          }
        ]
      }
    },
    {
      $unwind: "$products"
    },
    {
      $project: {
        _id: 1,
        ketdi: "$products.ketdi",
        priceOfProduct: "$products.priceOfProduct",
        status: "$status",
        payment: "$payment",
        discount: 1,
        products: 1,
        createdAt: 1,
        createdAtDate: {
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
      $unwind: "$products"
    },
    {
      $addFields: {
        "products.ketdi": "$ketdi",
        "products.priceOfProduct": "$priceOfProduct"
      }
    },
    {
      $group: {
        _id: "$_id",
        products: {
          $addToSet: "$products"
        },
        sumKetdi: {
          $sum: "$products.ketdi"
        },
        summa: {
          $sum: {
            $multiply: ["$products.priceOfProduct", "$products.ketdi"]
          }
        },
        payment: {
          $first: "$payment"
        },
        status: {
          $first: "$status"
        },
        discount: {
          $first: "$discount"
        },
        createdAt: {
          $first: "$createdAt"
        },
        createdAtDate: {
          $first: "$createdAtDate"
        },
      }
    },
    {
      $group: {
        _id: "$createdAtDate",
        sales: {
          $push: "$$ROOT"
        },
        summa: {
          $sum: "$summa"
        },
        sumKetdi: {
          $sum: "$sumKetdi"
        },
        payment: {
          $sum: "$payment"
        }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]

  try {
    const sales = await Sale.aggregate(aggr);

    let clientSalesSum = {};
    let total = {
      totalPayment: 0,
      totalSumma: 0,
      totalKetdi: 0,
    };
    sales.forEach((date) => {
      date.sales.sort((a, b) => b.createdAt - a.createdAt).forEach((sale) => {
        const payment = sale.payment;
        const summa = sale.summa;

        if (!clientSalesSum.hasOwnProperty(client._id)) {
          clientSalesSum[client._id] = client.cash;
        }

        const cashAfter = clientSalesSum[client._id]
        clientSalesSum[client._id] = cashAfter - payment + summa;
        const cashBefore = clientSalesSum[client._id]

        sale.cashAfter = cashAfter;
        sale.cashBefore = cashBefore;
      })
      total.totalPayment += date.payment
      total.totalSumma += date.summa
      total.totalKetdi += date.sumKetdi
    })

    const result = {
      data: sales,
      ...total
    }

    res.json(result);
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
import Sale from "../models/Sale.js"
import Product from "../models/Product.js"
import Client from "../models/Client.js"
import mongoose from "mongoose";

export const createSale = async (req, res, next) => {
  try {
    let totalPrice = 0;
    const productsToSell = [];

    const { clientId, products } = req.body;

    if (clientId === undefined) {
      for (const product of products) {
        await Product.findByIdAndUpdate(
          product.productId,
          { $inc: { soni: product.keldi } }
        );
        productsToSell.push(product)
      }

      const newSale = new Sale({
        products: productsToSell
      })

      await newSale.save();

      return res.status(200).send(newSale)
    }

    for (const product of products) {
      const existingProduct = await Product.findById(product.productId);
      if (existingProduct.soni < product.ketdi) {
        return res.status(400).json({ error: `${existingProduct.name} is not enough` });
      }

      totalPrice = totalPrice + parseInt(existingProduct.price) * parseInt(product.ketdi);

      productsToSell.push({
        productId: existingProduct._id,
        ketdi: product.ketdi
      });
    }

    const newSale = new Sale({
      clientId: new mongoose.Types.ObjectId(clientId),
      products: productsToSell,
      payment: req.body.payment
    });

    for (const product of productsToSell) {
      await Product.updateOne(
        { _id: product.productId },
        { $inc: { soni: -product.ketdi } }
      );
    }

    const savedSale = await newSale.save();

    const updatedClient = await Client.findByIdAndUpdate(
      { _id: clientId },
      {
        $push: { sales: savedSale._id },
        $inc: { cash: savedSale.payment - totalPrice }
      },
      { new: true }
    )

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Yes', callback_data: `update_sale_${sale._id}` },
            { text: 'No', callback_data: 'no' },
          ]
        ]
      }
    };
    bot.sendMessage(updatedClient.chatId, "Do you want to update", options);

    res.status(201).json(savedSale);
  } catch (error) {
    next(error);
  }
}

export const newCollection = async (req, res, next) => {
  try {
    const { products } = req.body;

    for (const product of products) {
      await Product.updateOne(
        { _id: product.productId },
        { $inc: { soni: product.keldi } }
      );
    }

    res.status(200).send("Updated successfully");
  } catch (err) {
    next(err);
  }
}

export const getSales = async (req, res, next) => {
  try {
    const finalDate = req?.query?.date
    const clientId = req?.query?.clientId

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
        $match: {
          $and: [
            {
              $expr: {
                $cond: {
                  if: { $eq: [finalDate, undefined] },
                  then: true,
                  else: { $eq: ["$createdAtDate", finalDate] }
                }
              }
            },
            {
              $expr: {
                $cond: {
                  if: { $eq: [clientId, undefined] },
                  then: true,
                  else: { $eq: ['$clientId', new mongoose.Types.ObjectId(clientId)] }
                }
              }
            },
            { clientId: { $exists: true } }
          ]
        },
      },
      {
        $unwind: "$products"
      },
      {
        $project: {
          _id: 1,
          clientId: 1,
          ketdi: "$products.ketdi",
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
          createdAtDate: {
            $first: "$createdAtDate"
          },
          clientName: {
            $first: "$clientName"
          },
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
        $sort: { createdAtDate: 1 }
      }
    ]);

    res.json(sales);
  } catch (err) {
    next(err);
  }
}

export const getSalesByClient = async (req, res, next) => {
  const clientId = req.params.clientId;
  try {
    const sales = await Sale.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(clientId)
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
        $sort: { _id: 1 }
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
    const sales = await Sale.aggregate([
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
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalKeldi: { $sum: "$products.keldi" },
          totalKetdi: { $sum: "$products.ketdi" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    sales.length === 0 && res.status(404).json("No sales");
    res.status(200).json(sales);
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
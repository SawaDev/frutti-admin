import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import { createError } from "../utils/error.js";

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ name: req.body.name });
    if (product) return next(createError(403, "Product already exists"));

    const newProduct = new Product(req.body);
    await newProduct.save();

    res.status(200).json(newProduct);
  } catch (err) {
    next(err)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updateProduct);
  } catch (err) {
    next(err);
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id)

    await Sale.updateMany(
      { products: { $elemMatch: { productId: req.params.id } } },
      { $pull: { products: { productId: req.params.id } }, $set: { updatedAt: Date.now() } },
      { multi: true }
    );

    await Sale.deleteMany({ products: { $size: 0 } });

    res.status(200).json("O'chirildi");
  } catch (err) {
    next(err);
  }
}

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
}

export const getStats = async (req, res, next) => {
  try {
    // Count number of products and overall cost
    const productsData = await Product.aggregate([
      {
        $group: {
          _id: null,
          productCount: { $sum: "$soni" },
          overallCost: { $sum: { $multiply: ["$soni", "$tanNarxi"] } }
        }
      }
    ]);
    const productsCount = productsData[0].productCount;
    const overallCost = productsData[0].overallCost;

    // Calculate monthly earnings
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    const salesData = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          monthlyEarnings: { $sum: "$payment" }
        }
      }
    ]);
    const monthlyEarnings = salesData.length ? salesData[0].monthlyEarnings : 0;

    // Calculate monthly sale
    const sales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $unwind: "$products"
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
        $group: {
          _id: null,
          monthlySale: {
            $sum: {
              $multiply: ["$products.ketdi", "$products.priceOfProduct"]
            }
          },
          monthlyProfit: {
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
      }
      
    ]);
    const monthlySale = sales.length ? sales[0].monthlySale : 0;
    const monthlyProfit = sales.length ? sales[0].monthlyProfit : 0;

    const warehouseInfo = {
      productsCount,
      overallCost,
      monthlyEarnings,
      monthlySale,
      monthlyProfit
    };

    res.status(200).json(warehouseInfo);
  } catch (err) {
    next(err);
  }

}
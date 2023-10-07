import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.js"
import usersRoute from "./routes/users.js"
import productsRoute from "./routes/products.js"
import salesRoute from "./routes/sales.js"
import clientsRoute from "./routes/clients.js"
import expensesRoute from "./routes/expenses.js"
import transactionsRoute from "./routes/transactions.js"
import cardsRoute from "./routes/cards.js"
import permissionsRoute from "./routes/permissions.js"
import TelegramBot from "node-telegram-bot-api";
import Client from "./models/Client.js";
import Product from "./models/Product.js";
import Sale from "./models/Sale.js";
import { verifyToken } from "./utils/verifyToken.js";
import axios from "axios";
import History from "./models/History.js";

const app = express();
dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from mongoDB!");
});

app.use(cors());
app.use(cookieParser())
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/products", productsRoute);
app.use("/api/sales", salesRoute);
app.use("/api/clients", clientsRoute);
app.use("/api/expenses", expensesRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/cards", cardsRoute);
app.use("/api/permissions", permissionsRoute);

const port = process.env.port || 8801;

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

// const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// bot.onText(/\/start/, async (msg) => {
//   const chatId = msg.chat.id;

//   try {
//     const client = await Client.findOne({ tgUsername: msg.chat.username });
//     if (client) {
//       await Client.updateOne({ _id: client._id }, { $set: { chatId: chatId } });
//     } else {
//       console.log('client not found');
//     }
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }

//   const message = `Frutti korxonasining telegram botiga xush kelibsiz!`;
//   bot.sendMessage(chatId, message);
// });

app.post('/api/sales', verifyToken, async (req, res, next) => {
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
        return res.status(400).json({ message: `Omborda ${existingProduct.name} dan ${product.ketdi} ta mahsulot mavjud emas!` });
      }

      totalPrice = totalPrice + parseInt(product.priceOfProduct) * parseInt(product.ketdi);

      productsToSell.push({
        productId: existingProduct._id,
        ketdi: product.ketdi,
        priceOfProduct: product.priceOfProduct
      });
    }

    const client = await Client.findById(clientId);
    // if (!client.chatId) {
    //   return res.status(404).json({ message: `${client.name} telegram botdan ro'yxatdan o'tmagan yoki telegram username xato berilgan!` })
    // }

    const newSale = new Sale({
      clientId: new mongoose.Types.ObjectId(clientId),
      products: productsToSell,
      amount: totalPrice,
      payment: req.body.payment,
      discount: req.body.discount
    });

    for (const product of productsToSell) {
      await Product.updateOne(
        { _id: product.productId },
        { $inc: { soni: -product.ketdi } }
      );
    }

    const savedSale = await newSale.save();

    const history = new History({
      actionType: "sale",
      action: "create",
      actionDetails: {
        ...savedSale
      }
    })

    await history.save();

    await Client.findByIdAndUpdate(
      { _id: clientId },
      {
        $push: { sales: savedSale._id },
        $inc: { cash: savedSale.payment - totalPrice }
      },
      { new: true }
    )

    // const options = {
    //   reply_markup: {
    //     inline_keyboard: [
    //       [
    //         { text: 'Yes', callback_data: `update_sale_${savedSale._id}` },
    //         { text: 'No', callback_data: `no_update_sale_${savedSale._id}` },
    //       ]
    //     ]
    //   }
    // };

    // const message = `Yangi harid ma'lumotlati:\nTo'lov: ${savedSale.payment}\n\nMahsulotlar:\n`

    // async function getProductById(productId) {
    //   try {
    //     const product = await Product.findById(productId);

    //     return product.name;
    //   } catch (err) {
    //     console.log(err);
    //   }
    // }

    // const productsString = await Promise.all(productsToSell.map(async (product) => {
    //   const foundProduct = await getProductById(product.productId);
    //   const productName = foundProduct ? foundProduct : 'Unknown';
    //   return `Nomi: ${productName}, soni: ${product.ketdi}\n`;
    // }))

    // const productsMessage = message + productsString.join("");

    // bot.sendMessage(updatedClient.chatId, productsMessage, options);

    res.status(201).json(savedSale);
  } catch (error) {
    next(error);
  }
})

// bot.on('callback_query', async (callbackQuery) => {
//   const chatId = callbackQuery.message.chat.id;
//   const messageId = callbackQuery.message.message_id;
//   const callbackData = callbackQuery.data;

//   if (callbackData.startsWith('update_sale_')) {
//     const saleId = callbackData.split('_')[2];

//     const updatedSale = await Sale.findByIdAndUpdate(saleId, { status: 'Tasdiqlandi' }, { new: true });

//     const message = `Yangi harid ma'lumotlati:\nHarid xolati: ${updatedSale.status}\nTo'lov: ${updatedSale.payment}\n\nMahsulotlar:\n`

//     async function getProductById(productId) {
//       try {
//         const product = await Product.findById(productId);

//         return product.name;
//       } catch (err) {
//         console.log(err);
//       }
//     }

//     const productsString = await Promise.all(updatedSale.products.map(async (product) => {
//       const foundProduct = await getProductById(product.productId);
//       const productName = foundProduct ? foundProduct : 'Unknown';
//       return `Nomi: ${productName}, soni: ${product.ketdi}\n`;
//     }))

//     const productsMessage = message + productsString.join("");

//     bot.sendMessage(chatId, productsMessage);

//     bot.deleteMessage(chatId, messageId);
//   } else if (callbackData.startsWith('no_')) {
//     const saleId = callbackData.split('_')[3];

//     const updatedSale = await Sale.findByIdAndUpdate(saleId, { status: 'Rad etildi' }, { new: true });

//     const message = `Harid: ${updatedSale.status}`;
//     bot.sendMessage(chatId, message);

//     bot.deleteMessage(chatId, messageId);
//   }
// });

// app.post('/api/sendmessage', async (req, res) => {
//   const { username, message } = req.body;

//   try {
//     const client = await Client.findOne({ tgUsername: username })

//     const options = {
//       reply_markup: {
//         inline_keyboard: [
//           [
//             { text: 'Yes', callback_data: 'yes' },
//             { text: 'No', callback_data: 'no' },
//           ]
//         ]
//       }
//     };

//     bot.sendMessage(client.chatId, message, options);
//     res.status(200).send('Message sent successfully');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error occurred while sending the message');
//   }
// });

app.listen(port, () => {
  connect();
  console.log("Connected to port 8801");
});

export { app };
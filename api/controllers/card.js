import mongoose from "mongoose";
import Card from "../models/Card.js";
import Transaction from "../models/Transaction.js";

export const createCard = async (req, res, next) => {
  try {
    const card = new Card(req.body);
    const savedCard = await card.save();
    res.status(201).json(savedCard);
  } catch (error) {
    next(error);
  }
};

export const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
};

export const getCardById = async (req, res, next) => {
  const { cardId } = req.params;
  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  const { cardId } = req.params;
  try {
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      req.body,
      { new: true }
    );
    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.status(200).json(updatedCard);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  const { cardId } = req.params;
  try {
    const deletedCard = await Card.findByIdAndRemove(
      cardId
    );
    if (!deletedCard) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const cardStatistics = async (req, res, next) => {
  try {
    const cardId = req.params.cardId;

    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const creditTransactions = await Transaction.aggregate([
      {
        $match: {
          cardId: new mongoose.Types.ObjectId(cardId),
          type: 'credit',
        },
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
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          transactions: { $push: '$$ROOT' },
        },
      },
    ]);

    const debitTransactions = await Transaction.aggregate([
      {
        $match: {
          cardId: new mongoose.Types.ObjectId(cardId),
          type: 'debit',
        },
      },
      {
        $lookup: {
          from: "expenses",
          localField: "expenseId",
          foreignField: "_id",
          as: "expense"
        }
      },
      {
        $unwind: "$expense"
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          transactions: { $push: '$$ROOT' },
        },
      },
    ]);

    const response = {
      balance: card.balance,
      totalCreditTransactions: creditTransactions.length > 0 ? creditTransactions[0].totalAmount : 0,
      totalDebitTransactions: debitTransactions.length > 0 ? debitTransactions[0].totalAmount : 0,
      creditTransactions: creditTransactions.length > 0 ? creditTransactions[0].transactions : [],
      debitTransactions: debitTransactions.length > 0 ? debitTransactions[0].transactions : [],
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

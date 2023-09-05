import Card from "../models/Card.js";
import Client from "../models/Client.js";
import Expense from "../models/Expense.js";

import Transaction from "../models/Transaction.js";

export const createTransaction = async (req, res, next) => {
  try {
    const transaction = new Transaction(req.body);

    const { type, amount } = req.body;

    if (type === 'credit') {
      const card = await Card.findById(req.body.cardId);
      const client = await Client.findById(req.body.clientId);

      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      client.cash += amount;
      card.balance += amount;
      card.transactions.push(transaction)

      await client.save();
      await card.save();
    } else if (type === "debit") {
      const card = await Card.findById(req.body.cardId);
      const expense = await Expense.findById(req.body.expenseId);

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      if (card.balance < expense.cost) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      card.balance -= expense.cost;
      card.transactions.push(transaction)
      await card.save();
    }

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  const { transactionId } = req.params;
  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  const { transactionId } = req.params;
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      req.body,
      { new: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  const { transactionId } = req.params;
  try {
    const deletedTransaction = await Transaction.findByIdAndRemove(
      transactionId
    );
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
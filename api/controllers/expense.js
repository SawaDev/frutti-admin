import Expense from "../models/Expense.js";

export const newExpense = async (req, res, next) => {
  try {
    const newExpense = new Expense(req.body);
    await newExpense.save();

    res.status(200).json(newExpense);
  } catch (err) {
    next(err);
  }
}

export const updateExpense = async (req, res, next) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedExpense);
  } catch (err) {
    next(err);
  }
}

export const deleteExpense = async (req, res, next) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json("Expense has been deleted.");
  } catch (err) {
    next(err);
  }
}

export const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    res.status(200).json(expense);
  } catch (err) {
    next(err);
  }
}

export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (err) {
    next(err);
  }
}

export const getExpenseStatistics = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalExpense: { $sum: '$cost' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $group: {
          _id: '$_id.year',
          expenses: {
            $push: {
              _id: '$_id.month',
              cost: '$totalExpense',
              count: '$count'
            },
          },
        },
      },
    ];

    const expenseStatistics = await Expense.aggregate(pipeline);

    const overallStatistics = {
      totalExpense: await Expense.aggregate([
        {
          $group: {
            _id: null,
            totalExpense: { $sum: '$cost' },
            count: { $sum: 1 },
          },
        },
      ]),
    };

    res.status(200).json({ expenseStatistics, overallStatistics });
  } catch (err) {
    next(err);
  }
};
import express from 'express';
import { deleteExpense, getExpense, getExpenses, getExpenseStatistics, newExpense, updateExpense } from '../controllers/expense.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

//POST
router.post("/", verifyToken, newExpense)

//Update
router.put("/:id", verifyToken, updateExpense)

//Delete
router.delete("/:id", verifyToken, deleteExpense)

//Get expense by id
router.get("/find/:id", getExpense)

//Get all expenses
router.get("/", getExpenses)

//Get expenses by year
router.get("/stats", getExpenseStatistics)

export default router;
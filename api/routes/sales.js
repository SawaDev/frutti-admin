import express from 'express';
import { createSale, dailySales, deleteSale, getSales, getSalesByClient, newCollection } from '../controllers/sale.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// router.post("/", verifyToken, createSale)
router.post("/newCollection", verifyToken, newCollection)
router.get("/", getSales)
router.get("/:clientId", getSalesByClient)
router.get("/:id/daily", dailySales)
router.delete("/:id", verifyToken, deleteSale)

export default router;
import express from 'express';

import {
  createCard,
  getCards,
  getCardById,
  updateCard,
  deleteCard,
  cardStatistics,
} from "../controllers/card.js";

import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", createCard);
router.get("/", getCards);
router.get("/:cardId", getCardById);
router.put("/:cardId", updateCard);
router.delete("/:cardId", deleteCard);
router.get("/:cardId/statistics", cardStatistics)

export default router;
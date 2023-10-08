import express from 'express';
import { createCoupon } from '../controllers/coupon.js';

import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", createCoupon);

export default router;
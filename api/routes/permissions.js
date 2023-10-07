import express from 'express';
import { getPermissions } from '../controllers/permission.js';

const router = express.Router();

//Get permissions
router.get("/",  getPermissions)


export default router;
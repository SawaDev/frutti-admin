import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import { createClient, deleteClient, getClient, getClients, getMontlySalesOfClients, updateClient } from '../controllers/client.js';

const router = express.Router();

//POST
router.post("/", verifyToken, createClient)

//Update
router.put("/:id", verifyToken, updateClient)

//Delete
router.delete("/:id", verifyToken, deleteClient)

//Get Client
router.get("/find/:id", getClient)

//Get Clients
router.get("/", getClients)

//Get Monthly Sales of Clients
router.get("/monthlySales", getMontlySalesOfClients)

export default router;
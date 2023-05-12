import Client from "../models/Client.js";
import { createError } from "../utils/error.js";

export const createClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ name: req.body.name })
    if (client) return next(createError(403, "Bu ismli xaridor mavjud!"));

    const newClient = new Client(req.body);
    await newClient.save();

    res.status(200).json(newClient);
  } catch (err) {
    next(err);
  }
}

export const updateClient = async (req, res, next) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedClient);
  } catch (err) {
    next(err);
  }
}

export const deleteClient = async (req, res, next) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.status(200).json("Client has been deleted.");
  } catch (err) {
    next(err);
  }
}

export const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    res.status(200).json(client);
  } catch (err) {
    next(err);
  }
}

export const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (err) {
    next(err);
  }
}
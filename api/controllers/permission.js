import Roles from "../models/Roles.js";
import { parseToken } from "../utils/verifyToken.js";

export const getPermissions = async (req, res, next) => {
  try {
    const authHeader = req.headers.token;

    const user = await parseToken(authHeader);
 
    const roles = await Roles.find()

    res.status(201).json(roles[0][user.role]);
  } catch (error) {
    next(error);
  }
};
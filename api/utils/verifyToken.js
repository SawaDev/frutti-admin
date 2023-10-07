import jwt from "jsonwebtoken";
import { createError } from "./error.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT, (err, user) => {
      if (err) return next(createError(403, "Token is not valid!"));
      req.user = user;

      if (req.user._doc.isAdmin) {
        return next();
      } else {
        return next(createError(401, "Sizda bunga ruxsat yo'q!"));
      }
    });
  } else {
    return next(createError(401, "Siz ro'yxatdan o'tmagansiz"));
  }
};

export const parseToken = (authHeader) => {
  return new Promise((resolve, reject) => {
    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, process.env.JWT, (err, user) => {
        if (err) {
          reject(createError(403, "Token is not valid!"));
        } else if (user) {
          resolve(user._doc);
        } else {
          reject(createError(401, "Sizda bunga ruxsat yo'q!"));
        }
      });
    } else {
      reject(createError(401, "Siz ro'yxatdan o'tmagansiz"));
    }
  });
};
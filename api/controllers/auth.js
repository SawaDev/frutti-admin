import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { createError } from "../utils/error.js";
import User from "../models/User.js";

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const user = await User.findOne({ username: req.body.username });
    if (user) return next(createError(403, "Username already exists"));

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(200).send("User has been created.");

  } catch (err) {
    next(err);
  }
}

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    )

    if (!isPasswordCorrect) return next(createError(400, "Wrong password"));

    const accessToken = jwt.sign(
      {
        ...user
      },
      process.env.JWT,
      {}
    )

    const { password, ...others } = user._doc;

    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    next(err);
  }
};
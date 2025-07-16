import { Router } from "express";
import { User } from "../models/user.js";
import { Image } from "../models/image.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { tokenStore } from "../middleware/auth.js";
import "dotenv/config";
import { authenticateToken } from "../middleware/auth.js";

export const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
  const data = req.body;

  if (!data.username || !data.password) {
    return res.status(400).json({
      Error: "Username and password are required to sign up.",
    });
  }

  const existingUser = await User.findOne({
    where: { username: data.username },
  });

  if (existingUser) {
    return res.status(409).json({
      Error: "User with the username " + data.username + " already exists",
    });
  }

  const saltRounds = 10;
  const salt = await bcrypt.genSaltSync(saltRounds);

  const hashedPassword = await bcrypt.hashSync(data.password, salt);
  const newUser = await User.create({
    username: data.username,
    password: hashedPassword,
  });

  return res.status(201).json({ userId: newUser.id });
});

userRouter.post("/login", async function (req, res) {
  const data = req.body;

  if (!data.username || !data.password) {
    return res.status(400).json({
      Error: "Username and password are required to log in.",
    });
  }

  const user = await User.findOne({ where: { username: data.username } });

  if (!user) {
    return res.status(404).json({
      Error: "User with the username " + data.username + " does not exist",
    });
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      Error: "Invalid password.",
    });
  }
  // eslint-disable no-undef
  const token = crypto.randomBytes(32).toString("hex");
  tokenStore.set(token, { userId: user.id, created: Date.now() });

  return res.json({
    accessToken: token,
    userId: user.id,
    username: user.username,
  });
});

userRouter.get("/:id/images/length", async function (req, res) {
  const userId = req.params.id;
  const count = await Image.count({ where: { userId: userId } });
  return res.json({ length: count });
});

userRouter.get("/galleries", async function (req, res) {
  const page = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const offset = page * limit;
  const galleries = await User.findAll({
    offset: offset,
    limit: limit,
    attributes: ["id", "username"],
    include: [
      {
        model: Image,
        required: true, // Only users with at least one image
        attributes: [], // Don't include image data in the result
      },
    ],
  });

  return res.json(galleries);
});

userRouter.get("/me", authenticateToken, async function (req, res) {
  const userId = req.user.userId;
  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({
      Error: "User not found.",
    });
  }

  return res.json({ username: user.username, userId: user.id });
});

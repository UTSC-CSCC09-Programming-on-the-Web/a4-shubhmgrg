import { Router } from "express";
import { Comment } from "../models/comments.js";
import { Image } from "../models/image.js";
import multer from "multer";
import { Op } from "sequelize";
import path from "path";
import { User } from "../models/user.js";
import { authenticateToken } from "../middleware/auth.js";

export const imagesRouter = Router();
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, and PNG files are allowed."), false);
    }
  },
});

imagesRouter.post(
  "/",
  authenticateToken,
  upload.single("picture"),
  async function (req, res) {
    const data = req.body;

    if (!req.user) {
      return res.status(401).json({ Error: "Please log in first." });
    }

    if (!data.title || !data.author || !req.file) {
      return res
        .status(400)
        .json({ Error: "Title, author, and picture are required." });
    }

    if (req.user.userId !== parseInt(data.author)) {
      return res.status(403).json({
        Error: "You are not allowed to upload images for other users.",
      });
    }

    const image = await Image.create({
      title: data.title,
      UserId: data.author,
      picture: req.file,
    });
    return res.json(image);
  },
);

imagesRouter.get("/:id/comments", authenticateToken, async function (req, res) {
  const cursor = req.query.cursor || null;
  const limit = parseInt(req.query.limit) || 10;
  const where = {
    ImageId: req.params.id,
  };
  if (cursor) {
    where.id = { [Op.lt]: cursor };
  }
  const comments = await Comment.findAll({
    where: where,
    limit: limit,
    order: [["id", "DESC"]],
    include: [{ model: User, attributes: ["username"] }],
  });
  const nextCursor =
    comments.length > 0 ? comments[comments.length - 1].id : null;
  return res.json({ comments: comments, cursor: nextCursor });
});

imagesRouter.get("/:id/picture", async (req, res) => {
  let userId = req.params.id;
  const user = await Image.findByPk(userId);
  if (user === null) {
    return res.status(404).json({ Error: "Image not found." });
  }
  res.setHeader("Content-Type", user.picture.mimetype);
  res.sendFile(user.picture.path, { root: path.resolve() });
});

// imagesRouter.get("/length", async function (req, res) {
//   const count = await Image.count();
//   return res.json({ length: count });
// });

imagesRouter.get("/:id", async function (req, res) {
  const cursor = req.query.cursor;
  const direction = req.query.direction || "desc";
  const userId = req.params.id;
  const limit = parseInt(req.query.limit) || 1;
  const where = {
    UserId: userId,
  };

  if (cursor && direction === "desc") {
    where.id = { [Op.lt]: cursor };
  }
  if (cursor && direction === "asc") {
    where.id = { [Op.gt]: cursor };
  }
  const images = await Image.findAll({
    where: where,
    order: [["id", direction]],
    limit: limit,
    include: [
      {
        model: User,
        attributes: ["username"],
      },
    ],
  });
  return res.json(images);
});

imagesRouter.delete("/:id", authenticateToken, async function (req, res) {
  const imageId = req.params.id;
  const image = await Image.findByPk(imageId);

  if (!image) {
    return res.status(404).json({
      Error: "Image does not exist",
    });
  }

  if (image.UserId !== req.user.userId) {
    return res
      .status(403)
      .json({ Error: "You are not allowed to delete this image." });
  }

  await Comment.destroy({
    where: {
      ImageId: imageId,
    },
  });

  await image.destroy();
  return res.json({ message: "Image deleted successfully" });
});

imagesRouter.use((err, req, res, next) => {
  if (err.message && err.message.includes("Only JPG")) {
    return res.status(400).json({ Error: err.message });
  }
  next(err);
});

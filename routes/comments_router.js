import { Router } from "express";
import { Image } from "../models/image.js";
import { Comment } from "../models/comments.js";
import { User } from "../models/user.js";
import { authenticateToken } from "../middleware/auth.js";

export const commentsRouter = Router();

commentsRouter.post("/", authenticateToken, async function (req, res) {
  const data = req.body;

  if (!data.content || !data.imageId || !data.author) {
    return res.status(400).json({
      Error: "Content, imageId, and author are required to create a comment.",
    });
  }

  const image = await Image.findByPk(data.imageId);
  const user = await User.findByPk(data.author);
  if (!user) {
    return res.status(404).json({
      Error: "User does not exist",
    });
  }

  if (!image) {
    return res.status(404).json({
      Error: "Image does not exist",
    });
  }

  const message = await Comment.create({
    content: data.content,
    ImageId: data.imageId,
    UserId: data.author,
  });

  const username = { username: user.username };

  message.dataValues.User = username;

  return res.json(message);
});

commentsRouter.delete("/:id", authenticateToken, async function (req, res) {
  const commentId = req.params.id;
  const comment = await Comment.findByPk(commentId, {
    include: [{ model: Image }],
  });

  if (!comment) {
    return res.status(404).json({
      Error: "Comment does not exist",
    });
  }

  if (comment.UserId !== req.user.userId && comment.Image.UserId !== req.user.userId) {
    return res
      .status(403)
      .json({ Error: "You are not allowed to delete this comment." });
  }

  await comment.destroy();
  return res.json({ message: "Comment deleted successfully" });
});

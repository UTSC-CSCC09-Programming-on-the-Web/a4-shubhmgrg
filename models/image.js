import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./user.js";

export const Image = sequelize.define("Image", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  picture: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

Image.belongsTo(User);
User.hasMany(Image);

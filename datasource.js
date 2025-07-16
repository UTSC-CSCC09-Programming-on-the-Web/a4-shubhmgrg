// datasource.js
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "/usr/src/app/data/database.sqlite",
});

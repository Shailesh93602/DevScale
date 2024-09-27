import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    pool: {
      max: 10,
      min: 0,
      acquire: 120000,
      idle: 20000,
    },
    logging: false,
  }
);

export default sequelize;

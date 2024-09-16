import { config } from "dotenv";
import mysql2 from "mysql2";

config();

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: 3306,
  dialect: "mysql",
  dialectModule: mysql2,
  dialectOptions: {
    charset: "utf8mb4",
    bigNumberStrings: true,
  },
  define: {
    timestamps: true,
  },
};

export default dbConfig;

import { config } from "dotenv";
import pg from "pg";

config();

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: 5432,
  dialect: "postgres",
  dialectModule: pg,
  dialectOptions: {
    charset: "utf8mb4",
    bigNumberStrings: true,
  },
  define: {
    timestamps: true,
  },
};

export default dbConfig;

import { config } from "dotenv";

config();

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: 3306,
  dialect: "mysql",
  dialectOptions: {
    bigNumberStrings: true,
  },
  define: {
    timestamps: true, // Ensures Sequelize is looking for timestamp fields
  },
};

export default dbConfig;

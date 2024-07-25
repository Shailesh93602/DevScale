import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Define the Resource model
export const Resource = sequelize.define(
  "Resource",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "resources",
    timestamps: true,
  }
);

// Define the Book model
export const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "books",
    timestamps: true,
  }
);

// Function to get all resources from the database
export const getAllResources = async () => {
  try {
    const resources = await Resource.findAll();
    return resources;
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw new Error("Database Error: Unable to fetch resources");
  }
};

// Function to get all books from the database
export const getAllBooks = async () => {
  try {
    const books = await Book.findAll();
    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Database Error: Unable to fetch books");
  }
};

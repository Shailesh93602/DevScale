// models/userModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true, // Ensures username is not empty
        len: [3, 50], // Username length must be between 3 and 50 characters
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Validates the email format
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Ensures password is not empty
        len: [6, 255], // Password length must be between 6 and 255 characters
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

export default User;

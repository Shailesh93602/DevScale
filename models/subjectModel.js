// models/subjectModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Adjust the import path as needed

const Subject = sequelize.define(
  "Subject",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Ensures name is not empty
        len: [3, 255], // Name length must be between 3 and 255 characters
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000], // Description length can be up to 2000 characters
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

export default Subject;

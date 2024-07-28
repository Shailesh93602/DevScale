// models/roadMapModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RoadMap = sequelize.define(
  "RoadMap",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Ensures title is not empty
        len: [3, 255], // Title length must be between 3 and 255 characters
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

export default RoadMap;

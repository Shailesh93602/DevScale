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
        notEmpty: true,
        len: [3, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000],
      },
    },
  },
  {
    timestamps: true,
  }
);

export default RoadMap;

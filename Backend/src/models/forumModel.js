// models/Forum.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Forum = sequelize.define(
  "Forum",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    createdBy: {
      type: DataTypes.UUID,
      references: {
        model: "Users", // Assumes you have a 'Users' model
        key: "id",
      },
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING), // For PostgreSQL; use JSON for other DBs
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default Forum;

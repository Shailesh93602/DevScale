"use strict";
import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/config.js";

class Forum extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      as: "createdByUser",
      foreignKey: "createdBy",
    });
  }
}

Forum.init(
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
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
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
    sequelize,
    modelName: "Forum",
    timestamps: true,
  }
);

export default Forum;

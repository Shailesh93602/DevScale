"use strict";
import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/config.js";

class Battle extends Model {
  static associate(models) {
    // Define associations here
    this.belongsTo(models.Topic, { foreignKey: "topicId" });
  }
}

Battle.init(
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
        len: [1, 255], // Limiting length for better control
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    topicId: {
      type: DataTypes.UUID,
      references: {
        model: "Topics", // Ensure this matches the model name in your database
        key: "id",
      },
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      allowNull: false,
    },
    length: {
      type: DataTypes.ENUM("short", "medium", "long"),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Battle",
    timestamps: true,
  }
);

export default Battle;

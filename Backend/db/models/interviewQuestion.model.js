"use strict";
import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/config.js";

class InterviewQuestion extends Model {
  static associate(models) {
    // Define associations here if needed
  }
}

InterviewQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      allowNull: true,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING), // For PostgreSQL; use JSON for other DBs
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "InterviewQuestion",
    timestamps: true,
  }
);

export default InterviewQuestion;

// models/InterviewQuestion.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const InterviewQuestion = sequelize.define(
  "InterviewQuestion",
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
      allowNull: true, // Assuming the answer might not be required initially
    },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"), // Example of difficulty levels
      allowNull: true,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true, // The topic or category of the question
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

export default InterviewQuestion;

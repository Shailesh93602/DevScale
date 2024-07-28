// models/topicModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Subject from "./subjectModel.js"; // Adjust the import path as needed

const Topic = sequelize.define(
  "Topic",
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
    subjectId: {
      type: DataTypes.UUID,
      references: {
        model: Subject,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

Subject.hasMany(Topic, { foreignKey: "subjectId" });
Topic.belongsTo(Subject, { foreignKey: "subjectId" });

export default Topic;

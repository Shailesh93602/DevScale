"use strict";
import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/config.js";

class Article extends Model {
  static associate(models) {
    // Define associations here
    this.belongsTo(models.Resource, { foreignKey: "topicId" });
  }
}

Article.init(
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
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    isSelected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    topicId: {
      type: DataTypes.UUID,
      references: {
        model: "Resources", // Ensure the model name matches the Resource model
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE", // Optional: Handle delete cascades if needed
    },
  },
  {
    sequelize,
    modelName: "Article",
    timestamps: true, // Include createdAt and updatedAt fields
  }
);

export default Article;

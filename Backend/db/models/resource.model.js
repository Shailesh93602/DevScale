"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Resource extends Model {
    static associate(models) {
      this.hasMany(models.Article, { foreignKey: "topicId" });
      this.hasMany(models.InterviewQuestion, { foreignKey: "resourceId" });

      // Ensure the inverse associations are set up correctly
      models.Article.belongsTo(this, { foreignKey: "topicId" });
      models.InterviewQuestion.belongsTo(this, { foreignKey: "resourceId" });
    }
  }

  Resource.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subtopic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Resource",
      timestamps: true,
    }
  );

  return Resource;
};

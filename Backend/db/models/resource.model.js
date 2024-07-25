"use strict";
import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/config.js";

class Resource extends Model {
  static associate(models) {
    this.hasMany(models.Article, { foreignKey: "topicId" });
    models.Article.belongsTo(this, { foreignKey: "topicId" });

    this.hasMany(models.InterviewQuestion, { foreignKey: "resourceId" });
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

export default Resource;

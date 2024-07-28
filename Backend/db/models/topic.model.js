"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Topic extends Model {
    static associate(models) {
      this.hasMany(models.Article, { foreignKey: "topicId" });
    }
  }

  Topic.init(
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
      sequelize,
      modelName: "Topic",
      timestamps: true,
    }
  );

  return Topic;
};

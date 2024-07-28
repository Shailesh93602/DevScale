"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Article extends Model {
    static associate(models) {
      this.belongsTo(models.Topic, { foreignKey: "topicId" });
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
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isSelected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      topicId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Topics",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Article",
      timestamps: true,
    }
  );

  return Article;
};

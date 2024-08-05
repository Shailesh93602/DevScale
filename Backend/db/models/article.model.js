"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Article extends Model {
    static associate(models) {
      this.belongsTo(models.Topic, { foreignKey: "topicId" });
      this.belongsTo(models.User, {
        foreignKey: "authorId",
        as: "author",
      });
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
          len: [3, 255],
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 2000],
        },
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      moderationNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      topicId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Topics",
          key: "id",
        },
        onDelete: "CASCADE",
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

"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Battle extends Model {
    static associate(models) {
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
          len: [1, 255],
        },
      },
      description: {
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
      difficulty: {
        type: DataTypes.ENUM("easy", "medium", "hard"),
        allowNull: false,
      },
      length: {
        type: DataTypes.ENUM("short", "medium", "long"),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Battle",
      timestamps: true,
    }
  );

  return Battle;
};

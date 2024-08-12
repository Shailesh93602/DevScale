"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Quiz extends Model {
    static associate(models) {
      // Define associations here
      this.belongsTo(models.Topic, { foreignKey: "topicId" });
    }
  }

  Quiz.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      passingScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 100,
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Quiz",
      timestamps: true,
    }
  );

  return Quiz;
};

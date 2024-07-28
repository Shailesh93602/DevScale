import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class InterviewQuestion extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  InterviewQuestion.init(
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
      },
      difficulty: {
        type: DataTypes.ENUM("easy", "medium", "hard"),
      },
      topic: {
        type: DataTypes.STRING,
      },
      tags: {
        type: DataTypes.JSON,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      resourceId: {
        type: DataTypes.UUID,
        references: {
          model: "Resources",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "InterviewQuestion",
      timestamps: true,
    }
  );

  return InterviewQuestion;
};

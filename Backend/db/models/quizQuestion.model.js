import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class QuizQuestion extends Model {
    static associate(models) {
      this.belongsTo(models.Quiz, { foreignKey: "quizId" });
    }
  }

  QuizQuestion.init(
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
      correctAnswer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "QuizQuestion",
      timestamps: true,
    }
  );

  return QuizQuestion;
};

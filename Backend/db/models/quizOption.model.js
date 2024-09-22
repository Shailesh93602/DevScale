import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class QuizOption extends Model {
    static associate(models) {
      this.belongsTo(models.QuizQuestion, { foreignKey: "quizQuestionId" });
    }
  }

  QuizOption.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      answerText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "QuizOption",
      timestamps: true,
    }
  );

  return QuizOption;
};

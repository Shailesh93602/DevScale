import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class QuizSubmissionAnswer extends Model {
    static associate(models) {
      this.belongsTo(models.QuizSubmission, { foreignKey: "submissionId" });
      this.belongsTo(models.QuizAnswer, { foreignKey: "answerId" });
      this.belongsTo(models.QuizQuestion, { foreignKey: "questionId" });
    }
  }

  QuizSubmissionAnswer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "QuizSubmissionAnswer",
      timestamps: true,
    }
  );

  return QuizSubmissionAnswer;
};

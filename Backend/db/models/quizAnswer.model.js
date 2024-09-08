import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class QuizAnswer extends Model {
    static associate(models) {
      this.belongsTo(models.QuizSubmission, { foreignKey: "submissionId" });
      this.belongsTo(models.QuizQuestion, { foreignKey: "questionId" });
    }
  }

  QuizAnswer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "QuizAnswer",
      timestamps: true,
    }
  );

  return QuizAnswer;
};

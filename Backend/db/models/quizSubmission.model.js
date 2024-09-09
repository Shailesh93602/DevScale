import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class QuizSubmission extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.Quiz, { foreignKey: "quizId" });
      this.hasMany(models.QuizSubmissionAnswer, { foreignKey: "submissionId" });
    }
  }

  QuizSubmission.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "QuizSubmission",
      timestamps: true,
    }
  );

  return QuizSubmission;
};

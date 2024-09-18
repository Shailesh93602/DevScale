import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Quiz extends Model {
    static associate(models) {
      this.belongsTo(models.Topic, { foreignKey: "topicId" });
      this.hasMany(models.QuizQuestion, { foreignKey: "quizId" });
    }
  }

  Quiz.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      passingScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
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

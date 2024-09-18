"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the submissionId column from QuizAnswers table
    await queryInterface.removeColumn("QuizAnswers", "submissionId");
  },

  down: async (queryInterface, Sequelize) => {
    // Add the submissionId column back to QuizAnswers table in case of rollback
    await queryInterface.addColumn("QuizAnswers", "submissionId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "QuizSubmissions",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },
};

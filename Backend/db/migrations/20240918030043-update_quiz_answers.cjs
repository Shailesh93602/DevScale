"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("QuizAnswers", "submissionId");
  },

  down: async (queryInterface, Sequelize) => {
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

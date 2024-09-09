"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuizSubmissionAnswers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      submissionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "QuizSubmissions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      questionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "QuizQuestions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      answerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "QuizAnswers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("QuizSubmissionAnswers");
  },
};

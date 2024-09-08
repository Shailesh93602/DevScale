"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuizAnswers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      answer: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("QuizAnswers");
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("QuizQuestions", "correctAnswer");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("QuizQuestions", "correctAnswer", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Challenges", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      difficulty: {
        type: Sequelize.ENUM("Easy", "Medium", "Hard"),
        allowNull: false,
      },
      inputFormat: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      outputFormat: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      exampleInput: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      exampleOutput: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      constraints: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      functionSignature: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Challenges");
  },
};

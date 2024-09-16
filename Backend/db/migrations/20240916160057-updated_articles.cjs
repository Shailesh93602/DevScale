"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the content column to handle larger text data
    await queryInterface.changeColumn("Articles", "content", {
      type: Sequelize.TEXT("long"),
      collate: "utf8mb4_unicode_ci",
      allowNull: false,
    });

    // Optionally modify the moderationNotes column if necessary to a larger text size
    await queryInterface.changeColumn("Articles", "moderationNotes", {
      type: Sequelize.TEXT("long"),
      collate: "utf8mb4_unicode_ci",
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the content column back to TEXT if needed
    await queryInterface.changeColumn("Articles", "content", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    // Revert the moderationNotes column back to TEXT
    await queryInterface.changeColumn("Articles", "moderationNotes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Articles", "content", {
      type: Sequelize.TEXT("long"),
      collate: "utf8mb4_unicode_ci",
      allowNull: false,
    });

    await queryInterface.changeColumn("Articles", "moderationNotes", {
      type: Sequelize.TEXT("long"),
      collate: "utf8mb4_unicode_ci",
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Articles", "content", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn("Articles", "moderationNotes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename 'name' to 'title'
    await queryInterface.renameColumn("Topics", "name", "title");

    // Add new column 'content'
    await queryInterface.addColumn("Topics", "content", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert 'title' back to 'name'
    await queryInterface.renameColumn("Topics", "title", "name");

    // Remove 'content' column
    await queryInterface.removeColumn("Topics", "content");
  },
};

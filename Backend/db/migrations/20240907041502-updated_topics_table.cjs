"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Topics", "name", "title");

    await queryInterface.addColumn("Topics", "content", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("Topics", "title", "name");
    await queryInterface.removeColumn("Topics", "content");
  },
};

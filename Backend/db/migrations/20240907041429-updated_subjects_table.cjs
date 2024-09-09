"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await queryInterface.addColumn("Subjects", "mainConceptId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "MainConcepts",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.removeColumn("Subjects", "link");
    await queryInterface.removeColumn("Subjects", "category");

    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Subjects", "mainConceptId");

    await queryInterface.addColumn("Subjects", "link", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Subjects", "category", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};

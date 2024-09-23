"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Subjects", "mainConceptId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "MainConcepts",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.removeColumn("Subjects", "link");
    await queryInterface.removeColumn("Subjects", "category");
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

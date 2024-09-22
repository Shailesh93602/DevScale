"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Alter the mainConceptId column to allow null
    await queryInterface.changeColumn("Subjects", "mainConceptId", {
      type: Sequelize.UUID,
      allowNull: true, // Make it optional
      references: {
        model: "MainConcepts",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert mainConceptId to not allow null (if needed)
    await queryInterface.changeColumn("Subjects", "mainConceptId", {
      type: Sequelize.UUID,
      allowNull: false, // Revert to original state (not optional)
      references: {
        model: "MainConcepts",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },
};

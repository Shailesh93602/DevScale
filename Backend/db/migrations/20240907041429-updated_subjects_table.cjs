"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add mainConceptId column with foreign key constraint, allowing null (optional)
    await queryInterface.addColumn("Subjects", "mainConceptId", {
      type: Sequelize.UUID,
      allowNull: true, // Making this optional
      references: {
        model: "MainConcepts",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // Remove the link and category columns as per original migration
    await queryInterface.removeColumn("Subjects", "link");
    await queryInterface.removeColumn("Subjects", "category");
  },

  async down(queryInterface, Sequelize) {
    // Remove mainConceptId foreign key column
    await queryInterface.removeColumn("Subjects", "mainConceptId");

    // Add back the link and category columns (reverting changes)
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

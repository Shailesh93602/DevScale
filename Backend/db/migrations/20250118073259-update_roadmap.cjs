"use strict";

const { Sequelize, DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("Roadmaps", "thumbnail", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Roadmaps", "userId", {
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "id",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Roadmaps", "thumbnail");
    await queryInterface.removeColumn("Roadmaps", "userId");
  },
};

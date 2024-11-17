"use strict";

const { Sequelize, DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("Battles", "startDate");
    await queryInterface.removeColumn("Battles", "endDate");
    await queryInterface.addColumn("Battles", "date", {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Battles", "time", {
      type: DataTypes.TIME,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Battles", "date");
    await queryInterface.removeColumn("Battles", "time");
    await queryInterface.addColumn("Battles", "startDate", {
      type: DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Battles", "endDate", {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },
};

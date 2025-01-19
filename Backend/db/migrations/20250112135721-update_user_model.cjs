"use strict";

const { Sequelize, DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("UserInfos", "bio", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UserInfos", "note", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("UserInfos", "profilePicture", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("UserInfos", "userId", {
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "id",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("UserInfos", "bio");
    await queryInterface.removeColumn("UserInfos", "note");
    await queryInterface.removeColumn("UserInfos", "profilePicture");
    await queryInterface.removeColumn("UserInfos", "userId");
  },
};

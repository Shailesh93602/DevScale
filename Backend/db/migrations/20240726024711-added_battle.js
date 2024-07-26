import { Sequelize } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface) {
    await queryInterface.createTable("Battles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      topicId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Topics",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      difficulty: {
        type: Sequelize.ENUM("easy", "medium", "hard"),
        allowNull: false,
      },
      length: {
        type: Sequelize.ENUM("short", "medium", "long"),
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Battles");
  },
};

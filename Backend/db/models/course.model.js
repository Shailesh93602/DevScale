"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Course extends Model {
    static associate(models) {
      // Define any potential associations here
    }
  }

  Course.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      instructor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Duration in hours",
      },
      level: {
        type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced"),
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Course",
      timestamps: true,
    }
  );

  return Course;
};

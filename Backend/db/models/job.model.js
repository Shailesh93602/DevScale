"use strict";
import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/config.js";

class Job extends Model {
  static associate(models) {
    // Define associations here if needed
  }
}

Job.init(
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
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    jobType: {
      type: DataTypes.ENUM("full-time", "part-time", "contract", "internship"),
      allowNull: true,
    },
    postedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    applicationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Job",
    timestamps: true,
  }
);

export default Job;

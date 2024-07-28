// models/Job.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Job = sequelize.define(
  "Job",
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
      allowNull: true, // Location of the job, if applicable
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2), // Example format for salary, adjust as needed
      allowNull: true,
    },
    jobType: {
      type: DataTypes.ENUM("full-time", "part-time", "contract", "internship"), // Example job types
      allowNull: true,
    },
    postedDate: {
      type: DataTypes.DATE,
      allowNull: true, // Date when the job was posted
    },
    applicationDeadline: {
      type: DataTypes.DATE,
      allowNull: true, // Deadline for job application
    },
  },
  {
    timestamps: true,
  }
);

export default Job;

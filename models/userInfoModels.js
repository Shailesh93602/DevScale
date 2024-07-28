// models/userInfoModel.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js"; // Adjust the import path as needed

const UserInfo = sequelize.define(
  "UserInfo",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Ensures fullName is not empty
        len: [3, 255], // Full name length must be between 3 and 255 characters
      },
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Male", "Female", "Other"]], // Validates gender to be one of the specified values
      },
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]{10}$/, // Ensures mobile number is exactly 10 digits
      },
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    university: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    college: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Semester must be at least 1
        max: 8, // Assuming a max of 8 semesters
      },
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

User.hasOne(UserInfo, { foreignKey: "userId" });
UserInfo.belongsTo(User, { foreignKey: "userId" });

export default UserInfo;

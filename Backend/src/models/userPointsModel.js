import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";

export const UserPoints = sequelize.define(
  "UserPoints",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "user_points",
  }
);

User.hasMany(UserPoints, { foreignKey: "userId" });
UserPoints.belongsTo(User, { foreignKey: "userId" });

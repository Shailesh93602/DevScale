"use strict";
import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/config.js";
import User from "./user.model.js";

class UserPoints extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "userId" });
  }
}

UserPoints.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
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
    sequelize,
    modelName: "UserPoints",
    timestamps: true,
  }
);

export default UserPoints;

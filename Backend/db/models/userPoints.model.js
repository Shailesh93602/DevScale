"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
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
          model: "Users", // Ensure the model name matches the User model
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

  return UserPoints;
};

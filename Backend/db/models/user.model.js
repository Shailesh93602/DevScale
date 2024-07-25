"use strict";
import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/config.js";

class User extends Model {
  static associate(models) {
    this.hasMany(models.Chat, { as: "Chats1", foreignKey: "user1" });
    this.hasMany(models.Chat, { as: "Chats2", foreignKey: "user2" });
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
  }
);

export default User;

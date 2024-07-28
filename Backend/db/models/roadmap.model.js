"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class RoadMap extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  RoadMap.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 255],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 2000],
        },
      },
    },
    {
      sequelize,
      modelName: "RoadMap",
      timestamps: true,
    }
  );

  return RoadMap;
};

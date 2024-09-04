"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class RoadMap extends Model {
    static associate(models) {
      // Many-to-many association with Subject
      this.belongsToMany(models.Subject, {
        through: models.RoadMapSubject,
        as: "subjects",
        foreignKey: "roadmapId",
        otherKey: "subjectId",
      });
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

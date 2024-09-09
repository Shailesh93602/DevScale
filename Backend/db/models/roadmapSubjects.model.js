"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class RoadMapSubject extends Model {
    static associate(models) {}
  }

  RoadMapSubject.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      roadmapId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "RoadMaps",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      subjectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Subjects",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "RoadMapSubject",
      timestamps: true,
    }
  );

  return RoadMapSubject;
};

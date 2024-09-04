"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class RoadMapSubject extends Model {}

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
      },
      subjectId: {
        type: DataTypes.UUID,
        allowNull: false,
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

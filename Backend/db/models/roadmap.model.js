"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class RoadMap extends Model {
    static associate(models) {
      // Define many-to-many relationship
      this.belongsToMany(models.Subject, {
        through: models.RoadMapSubject,
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
      title: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "RoadMap",
    }
  );

  RoadMap.associate = function (models) {
    RoadMap.belongsToMany(models.Subject, {
      through: models.RoadMapSubject,
      foreignKey: "roadmapId",
      as: "Subjects",
    });
  };

  return RoadMap;
};

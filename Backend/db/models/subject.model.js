"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Subject extends Model {
    static associate(models) {
      // Define many-to-many relationship
      this.belongsToMany(models.RoadMap, {
        through: models.RoadMapSubject,
        foreignKey: "subjectId",
        otherKey: "roadmapId",
      });
    }
  }

  Subject.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Subject",
    }
  );

  Subject.associate = function (models) {
    Subject.belongsToMany(models.RoadMap, {
      through: models.RoadMapSubject,
      foreignKey: "subjectId",
      as: "RoadMaps",
    });
  };

  return Subject;
};

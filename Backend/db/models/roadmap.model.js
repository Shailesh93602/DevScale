import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Roadmap extends Model {
    static associate(models) {
      this.hasMany(models.MainConcept, { foreignKey: "roadmapId" });
      this.hasMany(models.UserRoadmap, { foreignKey: "roadmapId" });
    }
  }

  Roadmap.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Roadmap",
      timestamps: true,
    }
  );

  return Roadmap;
};

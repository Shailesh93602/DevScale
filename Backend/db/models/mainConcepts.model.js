import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class MainConcept extends Model {
    static associate(models) {
      this.belongsTo(models.RoadMap, { foreignKey: "roadmapId" });
      this.hasMany(models.Subject, { foreignKey: "mainConceptId" });
    }
  }

  MainConcept.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "MainConcept",
      timestamps: true,
    }
  );

  return MainConcept;
};

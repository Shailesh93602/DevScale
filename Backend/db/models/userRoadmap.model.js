import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class UserRoadmap extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.RoadMap, { foreignKey: "roadmapId" });
    }
  }

  UserRoadmap.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      isCustom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "UserRoadmap",
      timestamps: true,
    }
  );

  return UserRoadmap;
};

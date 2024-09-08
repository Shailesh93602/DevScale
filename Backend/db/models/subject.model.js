import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Subject extends Model {
    static associate(models) {
      this.belongsTo(models.MainConcept, { foreignKey: "mainConceptId" });
      this.hasMany(models.Topic, { foreignKey: "subjectId" });
    }
  }

  Subject.init(
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
      modelName: "Subject",
      timestamps: true,
    }
  );

  return Subject;
};

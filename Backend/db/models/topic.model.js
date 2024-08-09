import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Topic extends Model {
    static associate(models) {
      this.hasMany(models.Article, { foreignKey: "topicId" });
      this.belongsTo(models.Subject, { foreignKey: "subjectId" });
    }
  }

  Topic.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 2000],
        },
      },
      subjectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Subjects",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Topic",
      timestamps: true,
    }
  );

  return Topic;
};

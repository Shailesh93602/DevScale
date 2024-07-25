import { DataTypes } from "sequelize";
import sequelize from "../../config/config.js";
import Subject from "./subject.model.js";

const Topic = sequelize.define(
  "Topic",
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
    subjectId: {
      type: DataTypes.UUID,
      references: {
        model: Subject,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

Subject.hasMany(Topic, { foreignKey: "subjectId" });
Topic.belongsTo(Subject, { foreignKey: "subjectId" });

export default Topic;

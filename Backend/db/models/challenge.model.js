import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Challenge extends Model {
    static associate(models) {
      // Define associations here if necessary
    }
  }

  Challenge.init(
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
      difficulty: {
        type: DataTypes.ENUM("Easy", "Medium", "Hard"),
        allowNull: false,
      },
      inputFormat: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      outputFormat: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      exampleInput: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      exampleOutput: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      constraints: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      functionSignature: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Challenge",
      timestamps: true,
    }
  );

  return Challenge;
};

import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class UserInfo extends Model {
    static associate(models) {}
  }

  UserInfo.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 50],
        },
      },
    },
    {
      sequelize,
      modelName: "UserInfo",
      timestamps: true,
    }
  );

  return UserInfo;
};

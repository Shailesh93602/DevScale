import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Chat, { as: "Chats1", foreignKey: "user1Id" });
      this.hasMany(models.Chat, { as: "Chats2", foreignKey: "user2Id" });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
    }
  );

  return User;
};

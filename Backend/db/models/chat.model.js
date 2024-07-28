import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Chat extends Model {
    static associate(models) {
      this.belongsTo(models.User, { as: "User1", foreignKey: "user1Id" });
      this.belongsTo(models.User, { as: "User2", foreignKey: "user2Id" });
    }
  }

  Chat.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user1Id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      user2Id: {
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
      modelName: "Chat",
      timestamps: true,
    }
  );

  return Chat;
};

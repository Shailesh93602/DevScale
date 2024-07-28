import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Chat extends Model {
    static associate(models) {
      this.belongsTo(models.User, { as: "User1", foreignKey: "user1" });
      this.belongsTo(models.User, { as: "User2", foreignKey: "user2" });
    }
  }

  Chat.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user1: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users", // Ensure this matches the model name used in your database
          key: "id",
        },
      },
      user2: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users", // Ensure this matches the model name used in your database
          key: "id",
        },
      },
      lastMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lastMessageDate: {
        type: DataTypes.DATE,
        allowNull: true,
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

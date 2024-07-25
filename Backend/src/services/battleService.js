import Battle from "../models/Battle.js";
import User from "../models/User.js";

export const insertBattle = async (battle) => {
  try {
    const result = await Battle.create(battle);
    return result;
  } catch (err) {
    throw err;
  }
};

export const findBattleById = async (id) => {
  try {
    const result = await Battle.findByPk(id, {
      include: {
        model: User,
        attributes: ["username"],
      },
    });
    return result;
  } catch (err) {
    throw err;
  }
};

export const findAllBattles = async () => {
  try {
    const result = await Battle.findAll({
      include: {
        model: User,
        attributes: ["username"],
      },
    });
    return result;
  } catch (err) {
    throw err;
  }
};

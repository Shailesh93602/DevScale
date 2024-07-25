import UserInfo from "../models/UserInfo.js";

export const insertUserInfo = async (userInfo) => {
  try {
    const result = await UserInfo.create(userInfo);
    return result;
  } catch (err) {
    throw err;
  }
};

export const findUserInfoByUserId = async (userId) => {
  try {
    const result = await UserInfo.findOne({ where: { userId } });
    return result;
  } catch (err) {
    throw err;
  }
};

export const updateUserInfoByUserId = async (userId, userInfo) => {
  try {
    const result = await UserInfo.update(userInfo, { where: { userId } });
    return result;
  } catch (err) {
    throw err;
  }
};

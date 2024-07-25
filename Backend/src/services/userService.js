import User from "../models/User.js";

export const createUser = async (user) => {
  try {
    const result = await User.create(user);
    return result;
  } catch (err) {
    throw err;
  }
};

export const findUserByEmail = async (email) => {
  try {
    const result = await User.findOne({ where: { email } });
    return result;
  } catch (err) {
    throw err;
  }
};

export const findUserByUsername = async (username) => {
  try {
    const result = await User.findOne({ where: { username } });
    return result;
  } catch (err) {
    throw err;
  }
};

export const updateUserPassword = async (email, password) => {
  try {
    const result = await User.update({ password }, { where: { email } });
    return result;
  } catch (err) {
    throw err;
  }
};

export const getAllUsers = async () => {
  try {
    const result = await User.findAll();
    return result;
  } catch (err) {
    throw err;
  }
};

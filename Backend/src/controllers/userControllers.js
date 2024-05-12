import UserInfo from '../models/userInfoModels.js';
import { logger } from '../helpers/logger.js';

export const insertProfile = async (req, res) => {
  try {
    const {
      fullName,
      dob,
      gender,
      mobile,
      whatsapp,
      address,
      university,
      college,
      branch,
      semester } = req.body;
    if (
      !fullName ||
      !dob ||
      !gender ||
      !mobile ||
      !whatsapp ||
      !address ||
      !university ||
      !college ||
      !branch ||
      !semester) res.status(300).json({ success: false, message: "Invalid payload" });

    const userInfo = new UserInfo({
      fullName,
      dob,
      gender,
      mobile,
      whatsapp,
      address,
      university,
      college,
      branch,
      semester
    });

    const result = await userInfo.save();
    const data = await result.toJSON();
    res.status(201).json({ success: true, message: "User inserted Successfully!" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Error adding user' });
  }
}

export const getProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const userInfo = await UserInfo.findOne({ email });
    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, userInfo });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const { name } = req.body;
    const updatedUser = await UserInfo.findOneAndUpdate(
      { email },
      { $set: { name } },
      { returnOriginal: false }
    );

    if (!updatedUser.value) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, name });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

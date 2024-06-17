import {
  insertUserInfo,
  findUserInfoByEmail,
  updateUserInfoByEmail,
} from "../models/userInfoModels.js";
import { logger } from "../helpers/logger.js";

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
      semester,
    } = req.body;
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
      !semester
    )
      return res
        .status(300)
        .json({ success: false, message: "Invalid payload" });

    const userInfo = {
      fullName,
      dob,
      gender,
      mobile,
      whatsapp,
      address,
      university,
      college,
      branch,
      semester,
    };

    insertUserInfo(userInfo, (err, result) => {
      if (err) {
        logger.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Error adding user" });
      }

      res
        .status(201)
        .json({ success: true, message: "User inserted Successfully!" });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Error adding user" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const email = req.user.email;
    findUserInfoByEmail(email, (err, userInfo) => {
      if (err || !userInfo) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, userInfo });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const { name } = req.body;

    updateUserInfoByEmail(email, { name }, (err, result) => {
      if (err || result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, name });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

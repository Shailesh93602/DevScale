import {
  insertUserInfo,
  findUserInfoByUserId,
  updateUserInfoByUserId,
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
      !address ||
      !university ||
      !college ||
      !branch ||
      !semester
    )
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });

    const userInfo = [
      req.user.id,
      fullName,
      dob,
      gender,
      mobile,
      whatsapp || mobile,
      address,
      university,
      college,
      branch,
      semester,
    ];

    insertUserInfo(userInfo, (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Error adding user" });
      }

      res
        .status(201)
        .json({ success: true, message: "User inserted Successfully!" });
    });
  } catch (error) {
    console.log(error);
    logger.error(error);
    res.status(500).json({ success: false, message: "Error adding user" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    findUserInfoByUserId(userId, (err, userInfo) => {
      if (err || !userInfo) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }
      userInfo.dob = userInfo.dob.toISOString().slice(0, 10);
      userInfo.achievements = userInfo.achievements?.split(",");
      userInfo.email = req.user.email;
      res.status(200).json({ success: true, userInfo });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
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
      bio,
    } = req.body;
    let achievements = req.body.achievements.join(",");

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
      bio,
      achievements,
    };

    updateUserInfoByUserId(userId, userInfo, (err, result) => {
      console.log(err, result);
      if (err || result.affectedRows === 0) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, userInfo });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

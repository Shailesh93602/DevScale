import { logger } from "../helpers/logger.js";
import User from "../../db/models/user.model.js";
import db from "../../db/models/index.js";

// Insert user profile
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
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

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

    await new Promise((resolve, reject) => {
      insertUserInfo(userInfo, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    res
      .status(201)
      .json({ success: true, message: "User profile inserted successfully" });
  } catch (error) {
    logger.error("Error inserting profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Error adding user profile" });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile details
    const userInfo = await db.UserInfo.findOne({ where: { id: userId } });
    if (!userInfo) {
      return res
        .status(200)
        .json({ success: true, message: "Please update your profile" });
    }

    userInfo.dob = userInfo.dob.toISOString().slice(0, 10);
    userInfo.achievements = userInfo.achievements?.split(",");
    userInfo.email = req.user.email;

    // Fetch additional user details if needed
    const userDetails = await User.findByPk(userId);
    res
      .status(200)
      .json({ success: true, userInfo: { ...userInfo, ...userDetails } });
  } catch (error) {
    logger.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update user profile
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
      achievements = [],
    } = req.body;

    const achievementsString = achievements.join(",");
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
      achievements: achievementsString,
      profilePicture: req.fileUrl,
    };

    const result = await updateUserInfoByUserId(userId, userInfo);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found" });
    }

    res.status(200).json({ success: true, userInfo });
  } catch (error) {
    logger.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

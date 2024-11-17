import { logger } from "../helpers/logger.js";
import User from "../../db/models/user.model.js";
import db from "../../db/models/index.js";

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

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userInfo = await db.UserInfo.findOne({ where: { id: userId } });
    if (!userInfo) {
      return res
        .status(200)
        .json({ success: true, message: "Please update your profile" });
    }

    userInfo.dob = userInfo.dob.toISOString().slice(0, 10);
    userInfo.achievements = userInfo.achievements?.split(",");
    userInfo.email = req.user.email;

    const userDetails = await User.findByPk(userId);
    res
      .status(200)
      .json({ success: true, userInfo: { ...userInfo, ...userDetails } });
  } catch (error) {
    logger.error("Error fetching profile:", error);
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

export const getUserProgress = async (req, res) => {
  const { userId } = req.user;

  try {
    const roadmaps = await db.RoadMap.findAll({
      include: [
        {
          model: db.MainConcept,
          as: "mainConcepts",
          include: [
            {
              model: db.Subject,
              as: "subjects",
              include: [
                {
                  model: db.Topic,
                  as: "topics",
                  include: [
                    {
                      model: db.UserProgress,
                      as: "progress",
                      where: { userId },
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json(roadmaps);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRoadmap = await db.UserRoadmap.findOne({ where: { userId } });

    if (!userRoadmap) {
      return res
        .status(200)
        .json({ success: true, message: "No roadmap found for the user" });
    }

    res.status(200).json({ success: true, userRoadmap });
  } catch (error) {
    logger.error("Error fetching user roadmap:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const insertUserRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const isRoadmapExists = await db.UserRoadmap.findOne({
      where: {
        userId,
      },
    });

    if (isRoadmapExists) {
      res.status(400).json({
        success: false,
        message:
          "You already added a Roadmap, please remove existing Roadmap to add another Roadmap",
      });
    }

    const { roadmapId } = req.body;
    const userRoadmap = await db.UserRoadmap.create({ userId, roadmapId });

    res.status(200).json({
      success: true,
      message: "User roadmap inserted successfully",
      userRoadmap,
    });
  } catch (error) {
    logger.error("Error inserting user roadmap:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteUserRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.UserRoadmap.destroy({
      where: { id },
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User roadmap not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User roadmap deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user roadmap:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserRoadmap = exports.insertUserRoadmap = exports.getUserRoadmap = exports.getUserProgress = exports.updateProfile = exports.getProfile = exports.insertProfile = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const index_1 = require("../utils/index");
exports.insertProfile = (0, index_1.catchAsync)(async (req, res) => {
    const { fullName, dob, gender, mobile, whatsapp, address, university, college, branch, semester, } = req.body;
    if (!fullName ||
        !dob ||
        !gender ||
        !mobile ||
        !address ||
        !university ||
        !college ||
        !branch ||
        !semester) {
        return res
            .status(400)
            .json({ success: false, message: 'All fields are required' });
    }
    const userInfo = {
        userId: req.user.id,
        fullName,
        dob,
        gender,
        mobile,
        whatsapp: whatsapp || mobile,
        address,
        university,
        college,
        branch,
        semester,
    };
    await prisma_1.default.userInfo.create({
        data: userInfo,
    });
    res
        .status(201)
        .json({ success: true, message: 'User profile inserted successfully' });
});
exports.getProfile = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { userInfo: true },
    });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userInfo = user.userInfo;
    const profile = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: userInfo?.fullName ?? '',
        bio: userInfo?.bio ?? '',
        avatar: userInfo?.profilePicture ?? '',
        memberSince: user.created_at,
        botJoinDate: userInfo?.created_at,
        note: userInfo?.note ?? '',
    };
    res.status(200).json({ success: true, profile });
});
exports.updateProfile = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const { name, username, email, bio, note } = req.body;
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { username, email },
    });
    await prisma_1.default.userInfo.upsert({
        where: { userId },
        update: { fullName: name, bio, note },
        create: { userId, fullName: name, bio, note },
    });
    res
        .status(200)
        .json({ success: true, message: 'Profile updated successfully' });
});
exports.getUserProgress = (0, index_1.catchAsync)(async (req, res) => {
    // const userId = req.user.id;
    // TODO: implement this method
    const roadmaps = await prisma_1.default.roadmap.findMany({
        include: {
            mainConcepts: {
                include: {
                    subjects: {
                        include: {
                            topics: {
                                include: {
                                // progress: {
                                //   where: { userId },
                                //   select: { id: true, status: true },
                                // },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    return res.status(200).json(roadmaps);
});
exports.getUserRoadmap = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const userRoadmap = await prisma_1.default.userRoadmap.findFirst({
        where: { userId },
    });
    if (!userRoadmap) {
        return res
            .status(200)
            .json({ success: true, message: 'No roadmap found for the user' });
    }
    res.status(200).json({ success: true, userRoadmap });
});
exports.insertUserRoadmap = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const isRoadmapExists = await prisma_1.default.userRoadmap.findFirst({
        where: { userId },
    });
    if (isRoadmapExists) {
        return res.status(400).json({
            success: false,
            message: 'You already added a Roadmap, please remove existing Roadmap to add another Roadmap',
        });
    }
    const { roadmapId } = req.body;
    const userRoadmap = await prisma_1.default.userRoadmap.create({
        data: { userId, roadmapId },
    });
    res.status(200).json({
        success: true,
        message: 'User roadmap inserted successfully',
        userRoadmap,
    });
});
exports.deleteUserRoadmap = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await prisma_1.default.userRoadmap.delete({
        where: { id },
    });
    if (!result) {
        return res
            .status(404)
            .json({ success: false, message: 'User roadmap not found' });
    }
    res
        .status(200)
        .json({ success: true, message: 'User roadmap deleted successfully' });
});
//# sourceMappingURL=userControllers.js.map
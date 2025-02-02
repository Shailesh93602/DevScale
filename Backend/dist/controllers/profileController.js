"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.insertProfile = void 0;
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
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    const userId = req.user.id;
    const profileData = {
        userId,
        fullName,
        dob: new Date(dob),
        gender,
        mobile,
        whatsapp: whatsapp || mobile,
        address,
        university,
        college,
        branch,
        semester,
    };
    const profile = await prisma_1.default.userInfo.create({ data: profileData });
    res.status(201).json({
        success: true,
        message: 'User inserted successfully!',
        profile,
    });
});
exports.getProfile = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const profile = await prisma_1.default.userInfo.findUnique({
        where: { userId },
        include: { user: true },
    });
    if (!profile) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
        success: true,
        userInfo: {
            ...profile,
            // dob: profile.dob.toISOString().slice(0, 10),
            // achievements: profile.achievements?.split(','),
            email: profile.user.email,
        },
    });
});
exports.updateProfile = (0, index_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const { fullName, dob, gender, mobile, whatsapp, address, university, college, branch, semester, bio, achievements: achievementsArray, } = req.body;
    const achievements = achievementsArray?.join(',');
    const profileData = {
        fullName,
        dob: new Date(dob),
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
        profilePicture: req.fileUrl,
    };
    const profile = await prisma_1.default.userInfo.update({
        where: { userId },
        data: profileData,
    });
    res.status(200).json({ success: true, userInfo: profile });
});
//# sourceMappingURL=profileController.js.map
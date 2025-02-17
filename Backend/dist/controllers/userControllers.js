"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertUser = exports.deleteUserRoadmap = exports.insertUserRoadmap = exports.getUserRoadmap = exports.getUserProgress = exports.updateProfile = exports.getProfile = exports.insertProfile = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
exports.insertProfile = (0, utils_1.catchAsync)(async (req, res) => {
    const { fullName, dob, gender, mobile, whatsapp, address, university, college, branch, semester, graduation_year, skills, github_url, linkedin_url, twitter_url, website_url, specialization, username, } = req.body;
    if (!fullName ||
        !dob ||
        !gender ||
        !mobile ||
        !address ||
        !university ||
        !college ||
        !branch ||
        !semester ||
        !graduation_year ||
        !skills ||
        !specialization) {
        return (0, apiResponse_1.sendResponse)(res, 'BAD_REQUEST', {
            message: 'Required fields: fullName, dob, gender, mobile, address, college, specialization',
        });
    }
    const userInfo = {
        supabase_id: req.user?.id,
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
        graduation_year: parseInt(graduation_year),
        skills: Array.isArray(skills) ? skills : [skills],
        github_url,
        linkedin_url,
        twitter_url,
        website_url,
        specialization,
        experience_level: 'beginner',
        username,
        email: req.user.email ?? '',
        full_name: fullName,
    };
    await prisma_1.default.user.create({
        data: userInfo,
    });
    return (0, apiResponse_1.sendResponse)(res, 'CREATED', {
        message: 'User profile inserted successfully',
    });
});
exports.getProfile = (0, utils_1.catchAsync)(async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        return (0, apiResponse_1.sendResponse)(res, 'NOT_FOUND', {
            message: 'User not found',
        });
    }
    (0, apiResponse_1.sendResponse)(res, 'SUCCESS', {
        message: 'User profile retrieved successfully',
        data: { user: (0, utils_1.parse)(user) },
    });
});
exports.updateProfile = (0, utils_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const { name, username, email, bio, note, specialization, college, graduation_year, skills, github_url, linkedin_url, twitter_url, website_url, } = req.body;
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            username,
            email,
            full_name: name,
            bio,
            note,
            specialization,
            college,
            graduation_year: graduation_year ? parseInt(graduation_year) : undefined,
            skills: skills ? (Array.isArray(skills) ? skills : [skills]) : undefined,
            github_url,
            linkedin_url,
            twitter_url,
            website_url,
        },
    });
    (0, apiResponse_1.sendResponse)(res, 'SUCCESS', {
        message: 'Profile updated successfully',
    });
});
exports.getUserProgress = (0, utils_1.catchAsync)(async (req, res) => {
    // const userId = req.user.id;
    // TODO: implement this method
    const roadmaps = await prisma_1.default.roadmap.findMany({
        include: {
            main_concepts: {
                include: {
                    subjects: {
                        include: {
                            topics: {
                                include: {
                                // progress: {
                                //   where: { user_id },
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
    (0, apiResponse_1.sendResponse)(res, 'SUCCESS', {
        message: 'User progress retrieved successfully',
        data: { roadmaps },
    });
});
exports.getUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
    const user_id = req.user.id;
    const userRoadmap = await prisma_1.default.userRoadmap.findFirst({
        where: { user_id },
    });
    if (!userRoadmap) {
        return res
            .status(200)
            .json({ success: true, message: 'No roadmap found for the user' });
    }
    res.status(200).json({ success: true, userRoadmap });
});
exports.insertUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
    const user_id = req.user?.id;
    if (!user_id) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const isRoadmapExists = await prisma_1.default.userRoadmap.findFirst({
        where: { user_id },
    });
    if (isRoadmapExists) {
        return res.status(400).json({
            success: false,
            message: 'You already added a Roadmap, please remove existing Roadmap to add another Roadmap',
        });
    }
    const { roadmap_id, topic_id } = req.body;
    const userRoadmap = await prisma_1.default.userRoadmap.create({
        data: {
            user_id,
            roadmap_id,
            topic_id,
        },
    });
    res.status(200).json({
        success: true,
        message: 'User roadmap inserted successfully',
        userRoadmap,
    });
});
exports.deleteUserRoadmap = (0, utils_1.catchAsync)(async (req, res) => {
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
exports.upsertUser = (0, utils_1.catchAsync)(async (req, res) => {
    const { userId, email, username, specialization, college, graduation_year, skills, github_url, linkedin_url, twitter_url, website_url, ...profileData } = req.body;
    // Add validation for new required fields
    if (!email || !username || !college || !specialization) {
        return (0, apiResponse_1.sendResponse)(res, 'BAD_REQUEST', {
            message: 'Email, username, college, and specialization are required',
        });
    }
    // Check for existing user
    const existingUser = await prisma_1.default.user.findFirst({
        where: {
            OR: [{ email }, { username }, ...(userId ? [{ id: userId }] : [])],
        },
    });
    // Update existing user
    if (existingUser) {
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                ...profileData,
                specialization,
                college,
                graduation_year: graduation_year
                    ? parseInt(graduation_year)
                    : undefined,
                skills: skills
                    ? Array.isArray(skills)
                        ? skills
                        : [skills]
                    : undefined,
                github_url,
                linkedin_url,
                twitter_url,
                website_url,
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                specialization: true,
                college: true,
            },
        });
        return (0, apiResponse_1.sendResponse)(res, 'SUCCESS', {
            message: 'User updated successfully',
            data: { user: (0, utils_1.parse)(updatedUser) },
        });
    }
    // Create new user
    const newUser = await prisma_1.default.user.create({
        data: {
            email,
            username,
            role: 'USER',
            specialization,
            college,
            graduation_year: graduation_year ? parseInt(graduation_year) : undefined,
            skills: skills ? (Array.isArray(skills) ? skills : [skills]) : undefined,
            github_url,
            linkedin_url,
            twitter_url,
            website_url,
            ...profileData,
        },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            specialization: true,
            college: true,
        },
    });
    (0, apiResponse_1.sendResponse)(res, 'USER_CREATED', {
        data: { user: newUser },
    });
});
//# sourceMappingURL=userControllers.js.map
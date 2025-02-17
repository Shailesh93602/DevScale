import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync, parse } from '../utils';
import { sendResponse } from '../utils/apiResponse';

export const insertProfile = catchAsync(async (req: Request, res: Response) => {
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
    graduation_year,
    skills,
    github_url,
    linkedin_url,
    twitter_url,
    website_url,
    specialization,
    username,
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
    !semester ||
    !graduation_year ||
    !skills ||
    !specialization
  ) {
    return sendResponse(res, 'BAD_REQUEST', {
      message:
        'Required fields: fullName, dob, gender, mobile, address, college, specialization',
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
    experience_level: 'beginner' as const,
    username,
    email: req.user.email ?? '',
    full_name: fullName,
  };

  await prisma.user.create({
    data: userInfo,
  });

  return sendResponse(res, 'CREATED', {
    message: 'User profile inserted successfully',
  });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { supabase_id: req.user.id },
  });

  if (!user) {
    return sendResponse(res, 'NOT_CREATED', {
      message: 'User not cerated',
    });
  }

  sendResponse(res, 'SUCCESS', {
    message: 'User profile retrieved successfully',
    data: { user: parse(user) },
  });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const {
    name,
    username,
    email,
    bio,
    note,
    specialization,
    college,
    graduation_year,
    skills,
    github_url,
    linkedin_url,
    twitter_url,
    website_url,
  } = req.body;

  await prisma.user.update({
    where: { supabase_id: userId },
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

  sendResponse(res, 'SUCCESS', {
    message: 'Profile updated successfully',
  });
});

export const getUserProgress = catchAsync(
  async (req: Request, res: Response) => {
    // const userId = req.user.id;

    // TODO: implement this method
    const roadmaps = await prisma.roadmap.findMany({
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

    sendResponse(res, 'SUCCESS', {
      message: 'User progress retrieved successfully',
      data: { roadmaps },
    });
  }
);

export const getUserRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const userRoadmap = await prisma.userRoadmap.findFirst({
      where: { user_id },
    });

    if (!userRoadmap) {
      return res
        .status(200)
        .json({ success: true, message: 'No roadmap found for the user' });
    }

    res.status(200).json({ success: true, userRoadmap });
  }
);

export const insertUserRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isRoadmapExists = await prisma.userRoadmap.findFirst({
      where: { user_id },
    });

    if (isRoadmapExists) {
      return res.status(400).json({
        success: false,
        message:
          'You already added a Roadmap, please remove existing Roadmap to add another Roadmap',
      });
    }

    const { roadmap_id, topic_id } = req.body;
    const userRoadmap = await prisma.userRoadmap.create({
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
  }
);

export const deleteUserRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await prisma.userRoadmap.delete({
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
  }
);

export const upsertUser = catchAsync(async (req: Request, res: Response) => {
  const {
    userId,
    email,
    username,
    specialization,
    college,
    graduation_year,
    skills,
    github_url,
    linkedin_url,
    twitter_url,
    website_url,
    ...profileData
  } = req.body;

  // Add validation for new required fields
  if (!email || !username || !college || !specialization) {
    return sendResponse(res, 'BAD_REQUEST', {
      message: 'Email, username, college, and specialization are required',
    });
  }

  // Check for existing user
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }, ...(userId ? [{ id: userId }] : [])],
    },
  });

  // Update existing user
  if (existingUser) {
    const updatedUser = await prisma.user.update({
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

    return sendResponse(res, 'SUCCESS', {
      message: 'User updated successfully',
      data: { user: parse(updatedUser) },
    });
  }

  // Create new user
  const newUser = await prisma.user.create({
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

  sendResponse(res, 'USER_CREATED', {
    data: { user: newUser },
  });
});

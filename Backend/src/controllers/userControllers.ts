import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils';

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

  await prisma.user.create({
    data: {
      ...userInfo,
      supabase_id: req.user.supabase_id,
      email: req.user.email,
      username: req.user.username,
      experience_level: 'beginner',
    },
  });

  res
    .status(201)
    .json({ success: true, message: 'User profile inserted successfully' });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const profile = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user?.full_name ?? '',
    bio: user?.bio ?? '',
    avatar: user?.avatar_url ?? '',
    memberSince: user.created_at,
    botJoinDate: user?.created_at,
    note: user?.note ?? '',
  };

  res.status(200).json({ success: true, profile });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name, username, email, bio, note } = req.body;

  await prisma.user.update({
    where: { id: userId },
    data: { username, email },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { full_name: name, bio, note },
  });

  res
    .status(200)
    .json({ success: true, message: 'Profile updated successfully' });
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

    return res.status(200).json(roadmaps);
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
  const { userId, email, username, password, ...profileData } = req.body;

  // Required fields check
  if (!email || !username) {
    return res.status(400).json({
      success: false,
      message: 'Email and username are required fields',
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
    if (existingUser.id !== userId) {
      return res.status(409).json({
        success: false,
        message: 'Email or username already exists',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { ...profileData },
      select: { id: true, email: true, username: true, role: true },
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  }

  // Create new user
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required for new users',
    });
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      role: 'USER',
      ...profileData,
    },
    select: { id: true, email: true, username: true, role: true },
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser,
  });
});

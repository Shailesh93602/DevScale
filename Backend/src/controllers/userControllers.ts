import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync } from '../utils/index';

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

  await prisma.userInfo.create({
    data: userInfo,
  });

  res
    .status(201)
    .json({ success: true, message: 'User profile inserted successfully' });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
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

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { name, username, email, bio, note } = req.body;

  await prisma.user.update({
    where: { id: userId },
    data: { username, email },
  });

  await prisma.userInfo.upsert({
    where: { userId },
    update: { fullName: name, bio, note },
    create: { userId, fullName: name, bio, note },
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
  }
);

export const getUserRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const userRoadmap = await prisma.userRoadmap.findFirst({
      where: { userId },
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
    const userId = req.user.id;

    const isRoadmapExists = await prisma.userRoadmap.findFirst({
      where: { userId },
    });

    if (isRoadmapExists) {
      return res.status(400).json({
        success: false,
        message:
          'You already added a Roadmap, please remove existing Roadmap to add another Roadmap',
      });
    }

    const { roadmapId } = req.body;
    const userRoadmap = await prisma.userRoadmap.create({
      data: { userId, roadmapId },
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

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

  const profile = await prisma.userInfo.create({ data: profileData });

  res.status(201).json({
    success: true,
    message: 'User inserted successfully!',
    profile,
  });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const profile = await prisma.userInfo.findUnique({
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

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
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
    achievements: achievementsArray,
  } = req.body;

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

  const profile = await prisma.userInfo.update({
    where: { userId },
    data: profileData,
  });

  res.status(200).json({ success: true, userInfo: profile });
});

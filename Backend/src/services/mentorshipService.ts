import { PrismaClient, Mentorship, MentorshipStatus } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { getCache, setCache, deleteCache } from './cacheService';

const prisma = new PrismaClient();

interface MentorshipRequestData {
  mentorId: string;
  menteeId: string;
  topics: string[];
  description?: string;
}

export const requestMentorship = async (
  data: MentorshipRequestData
): Promise<Mentorship> => {
  const existing = await prisma.mentorship.findUnique({
    where: {
      mentorId_menteeId: {
        mentorId: data.mentorId,
        menteeId: data.menteeId,
      },
    },
  });

  if (existing) throw createAppError('Mentorship request already exists', 400);

  const mentorship = await prisma.mentorship.create({
    data: {
      ...data,
      status: MentorshipStatus.pending,
    },
    include: {
      mentor: {
        select: { username: true, avatar_url: true, experience_level: true },
      },
      mentee: { select: { username: true, avatar_url: true } },
    },
  });

  await deleteCache(`mentor:${data.mentorId}:requests`);
  await deleteCache(`mentee:${data.menteeId}:requests`);
  return mentorship;
};

export const updateMentorshipStatus = async (
  id: string,
  status: MentorshipStatus
): Promise<Mentorship> => {
  const mentorship = await prisma.mentorship.update({
    where: { id },
    data: { status },
    include: {
      mentor: { select: { username: true, avatar_url: true } },
      mentee: { select: { username: true, avatar_url: true } },
    },
  });

  await deleteCache(`mentor:${mentorship.mentorId}:requests`);
  await deleteCache(`mentee:${mentorship.menteeId}:requests`);
  return mentorship;
};

export const getMentorshipRequests = async (
  userId: string,
  role: 'mentor' | 'mentee'
) => {
  const cacheKey = `mentorship:${userId}:${role}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const requests = await prisma.mentorship.findMany({
    where: role === 'mentor' ? { mentorId: userId } : { menteeId: userId },
    include: {
      mentor: {
        select: { username: true, avatar_url: true, experience_level: true },
      },
      mentee: { select: { username: true, avatar_url: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  await setCache(cacheKey, requests, { ttl: 3600 });
  return requests;
};

export const getMentorshipDetails = async (id: string) => {
  const cacheKey = `mentorship:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const mentorship = await prisma.mentorship.findUnique({
    where: { id },
    include: {
      mentor: {
        select: { username: true, avatar_url: true, experience_level: true },
      },
      mentee: { select: { username: true, avatar_url: true } },
    },
  });

  if (!mentorship) throw createAppError('Mentorship not found', 404);

  await setCache(cacheKey, mentorship, { ttl: 3600 });
  return mentorship;
};

export const addMentorshipSession = async (
  mentorshipId: string,
  data: {
    date: Date;
    duration: number;
    notes?: string;
    objectives?: string[];
  }
) => {
  const session = await prisma.mentorshipSession.create({
    data: {
      ...data,
      mentorship: { connect: { id: mentorshipId } },
    },
  });

  await deleteCache(`mentorship:${mentorshipId}`);
  return session;
};

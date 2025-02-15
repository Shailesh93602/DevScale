import { PrismaClient, Mentorship, MentorshipStatus } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import { getCache, setCache, deleteCache } from './cacheService';

const prisma = new PrismaClient();

interface MentorshipRequestData {
  mentor_id: string;
  mentee_id: string;
  topics: string[];
  description?: string;
}

export const requestMentorship = async (
  data: MentorshipRequestData
): Promise<Mentorship> => {
  const existing = await prisma.mentorship.findUnique({
    where: {
      mentor_id_mentee_id: {
        mentor_id: data.mentor_id,
        mentee_id: data.mentee_id,
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

  await deleteCache(`mentor:${data.mentor_id}:requests`);
  await deleteCache(`mentee:${data.mentee_id}:requests`);
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

  await deleteCache(`mentor:${mentorship.mentor_id}:requests`);
  await deleteCache(`mentee:${mentorship.mentee_id}:requests`);
  return mentorship;
};

export const getMentorshipRequests = async (
  user_id: string,
  role: 'mentor' | 'mentee'
) => {
  const cacheKey = `mentorship:${user_id}:${role}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const requests = await prisma.mentorship.findMany({
    where: role === 'mentor' ? { mentor_id: user_id } : { mentee_id: user_id },
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
  mentorship_id: string,
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
      mentorship: { connect: { id: mentorship_id } },
    },
  });

  await deleteCache(`mentorship:${mentorship_id}`);
  return session;
};

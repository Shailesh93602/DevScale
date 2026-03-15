import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import { ForumRepository } from '../repositories/forumRepository';
export default class CommunityForumController {
  private readonly forumRepo: ForumRepository;

  constructor() {
    this.forumRepo = new ForumRepository();
  }

  public getForums = catchAsync(async (req: Request, res: Response) => {
    const forums = await this.forumRepo.findMany({
      orderBy: { created_at: 'asc' },
    });
    return sendResponse(res, 'FORUMS_FETCHED', { data: forums });
  });

  public getForum = catchAsync(async (req: Request, res: Response) => {
    const forumId = req.params.id;
    const forum = await this.forumRepo.findUnique({
      where: { id: forumId },
    });

    if (!forum) {
      return sendResponse(res, 'FORUM_NOT_FOUND');
    }

    return sendResponse(res, 'FORUM_FETCHED', { data: forum });
  });

  public createForum = catchAsync(async (req: Request, res: Response) => {
    const { title, description } = req.body;

    if (!title || !description) {
      return sendResponse(res, 'INVALID_PAYLOAD');
    }

    const forum = await this.forumRepo.create({
      data: {
        title,
        description,
        created_by: req.user?.id ?? '',
      },
    });

    return sendResponse(res, 'FORUM_CREATED', { data: forum });
  });

  public updateForum = catchAsync(async (req: Request, res: Response) => {
    const forumId = req.params.id;
    const { title, description } = req.body;

    if (!title || !description) {
      return sendResponse(res, 'INVALID_PAYLOAD');
    }

    const forum = await this.forumRepo.findUnique({
      where: { id: forumId },
    });

    if (!forum) {
      return sendResponse(res, 'FORUM_NOT_FOUND');
    }

    const updatedForum = await this.forumRepo.update({
      where: { id: forumId },
      data: { title, description },
    });

    return sendResponse(res, 'FORUM_UPDATED', { data: updatedForum });
  });

  public deleteForum = catchAsync(async (req: Request, res: Response) => {
    const forumId = req.params.id;

    const forum = await this.forumRepo.findUnique({
      where: { id: forumId },
    });

    if (!forum) {
      return sendResponse(res, 'FORUM_NOT_FOUND');
    }

    await this.forumRepo.delete({
      where: { id: forumId },
    });

    return sendResponse(res, 'FORUM_DELETED');
  });
}

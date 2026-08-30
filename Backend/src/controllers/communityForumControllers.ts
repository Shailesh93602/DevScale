import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import { ForumRepository } from '../repositories/forumRepository';
import { sanitizeText, sanitizeRichText } from '../utils/sanitize';
import { assertOwnership } from '../utils/assertOwnership';
import { recordActionBestEffort } from '../services/auditTrail';
import logger from '../utils/logger';
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
    const title = sanitizeText(req.body.title ?? '');
    const description = sanitizeRichText(req.body.description ?? '');

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
    const title = sanitizeText(req.body.title ?? '');
    const description = sanitizeRichText(req.body.description ?? '');

    if (!title || !description) {
      return sendResponse(res, 'INVALID_PAYLOAD');
    }

    const forum = await this.forumRepo.findUnique({
      where: { id: forumId },
    });

    if (!forum) {
      return sendResponse(res, 'FORUM_NOT_FOUND');
    }

    if (
      assertOwnership(req, res, (forum as { created_by?: string }).created_by)
    )
      return;

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

    // ADMIN-gated with no ownership check, so this is an admin removing
    // somebody ELSE's discussion — and the row it deletes is the only other
    // evidence it existed. Record the author, or "who deleted my thread?" has
    // no answer at all after the fact.
    await recordActionBestEffort(
      {
        admin_id: req.user?.id ?? 'unknown',
        action: 'DELETE_FORUM',
        entity: 'FORUM',
        entity_id: forumId,
        details: {
          title: (forum as { title?: string }).title,
          authorId: (forum as { created_by?: string }).created_by,
        },
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      logger
    );

    return sendResponse(res, 'FORUM_DELETED');
  });
}

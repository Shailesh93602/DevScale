import { Request, Response } from 'express';
import SupportRepository from '../repositories/supportRepository';
import { createAppError } from '../middlewares/errorHandler';
import { validateRequest } from '../middlewares/validateRequest';
import { sendResponse } from '../utils/apiResponse';
import {
  ticketSchema,
  bugReportSchema,
  featureRequestSchema,
  helpArticleSchema,
} from '../validations/supportValidations';
import { catchAsync } from '../utils';

export default class SupportController {
  private readonly supportRepo: SupportRepository;

  constructor() {
    this.supportRepo = new SupportRepository();
  }

  public createTicket = catchAsync(async (req: Request, res: Response) => {
    validateRequest(ticketSchema, req.body);
    const ticket = await this.supportRepo.createTicket({
      ...req.body,
      userId: req.user?.id,
    });
    sendResponse(res, 'TICKET_CREATED', { data: ticket });
  });

  public updateTicketStatus = catchAsync(
    async (req: Request, res: Response) => {
      const { ticketId } = req.params;
      const { status } = req.body;
      const ticket = await this.supportRepo.updateTicketStatus(
        ticketId,
        status,
        req.user?.id
      );
      sendResponse(res, 'TICKET_STATUS_UPDATED', { data: ticket });
    }
  );

  public addTicketResponse = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const { content, isInternal } = req.body;
    const response = await this.supportRepo.addTicketResponse(
      ticketId,
      req.user?.id,
      content,
      isInternal
    );
    sendResponse(res, 'TICKET_RESPONSE_ADDED', { data: response });
  });

  public createBugReport = catchAsync(async (req: Request, res: Response) => {
    validateRequest(bugReportSchema, req.body);
    const report = await this.supportRepo.createBugReport({
      ...req.body,
      userId: req.user?.id,
    });
    sendResponse(res, 'BUG_REPORT_CREATED', { data: report });
  });

  public createFeatureRequest = catchAsync(
    async (req: Request, res: Response) => {
      validateRequest(featureRequestSchema, req.body);
      const request = await this.supportRepo.createFeatureRequest({
        ...req.body,
        userId: req.user?.id,
      });
      sendResponse(res, 'FEATURE_REQUEST_CREATED', { data: request });
    }
  );

  public voteFeatureRequest = catchAsync(
    async (req: Request, res: Response) => {
      const { requestId } = req.params;
      await this.supportRepo.voteFeatureRequest(requestId, req.user?.id);
      sendResponse(res, 'FEATURE_REQUEST_VOTED');
    }
  );

  public createHelpArticle = catchAsync(async (req: Request, res: Response) => {
    validateRequest(helpArticleSchema, req.body);
    const article = await this.supportRepo.createHelpArticle(req.body);
    sendResponse(res, 'HELP_ARTICLE_CREATED', { data: article });
  });

  public searchHelpArticles = catchAsync(
    async (req: Request, res: Response) => {
      const { query } = req.query;
      if (typeof query !== 'string') {
        throw createAppError('Invalid query parameter', 400);
      }
      const articles = await this.supportRepo.searchHelpArticles(query);
      sendResponse(res, 'HELP_ARTICLES_FETCHED', { data: articles });
    }
  );
}

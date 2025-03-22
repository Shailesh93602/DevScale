import { Request, Response, NextFunction } from 'express';
import { SupportService } from '../services/supportService';
import { createAppError } from '../middlewares/errorHandler';
import { validateRequest } from '../middlewares/validateRequest';
import { sendResponse } from '../utils/apiResponse';
import {
  ticketSchema,
  bugReportSchema,
  featureRequestSchema,
  helpArticleSchema,
} from '../validations/supportValidations';

export const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRequest(ticketSchema, req.body);
    const ticket = await SupportService.createTicket({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const ticket = await SupportService.updateTicketStatus(
      ticketId,
      status,
      req.user!.id
    );
    sendResponse(res, 'TICKET_STATUS_UPDATED', { data: ticket });
  } catch (error) {
    next(error);
  }
};

export const addTicketResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ticketId } = req.params;
    const { content, isInternal } = req.body;
    const response = await SupportService.addTicketResponse(
      ticketId,
      req.user!.id,
      content,
      isInternal
    );
    res.status(201).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const createBugReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRequest(bugReportSchema, req.body);
    const report = await SupportService.createBugReport({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const createFeatureRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRequest(featureRequestSchema, req.body);
    const request = await SupportService.createFeatureRequest({
      ...req.body,
      userId: req.user!.id,
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const voteFeatureRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { requestId } = req.params;
    await SupportService.voteFeatureRequest(requestId, req.user!.id);
    sendResponse(res, 'FEATURE_REQUEST_VOTED');
  } catch (error) {
    next(error);
  }
};

export const createHelpArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRequest(helpArticleSchema, req.body);
    const article = await SupportService.createHelpArticle(req.body);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

export const searchHelpArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;
    if (typeof query !== 'string') {
      throw createAppError('Invalid query parameter', 400);
    }
    const articles = await SupportService.searchHelpArticles(query);
    sendResponse(res, 'HELP_ARTICLES_FETCHED', { data: articles });
  } catch (error) {
    next(error);
  }
};

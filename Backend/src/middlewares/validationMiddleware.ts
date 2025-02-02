import { NextFunction, Request, Response } from 'express';

export const validateBattleCreation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, topicId, difficulty, date, time } = req.body;
  if (!title || !description || !topicId || !difficulty || !date || !time) {
    res.status(400).json({
      success: false,
      message: 'Title, description, topic, and difficulty are required.',
    });
    return;
  }

  next();
};

export const validateChatCreation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, participants } = req.body;

  if (
    !title ||
    !participants ||
    !Array.isArray(participants) ||
    participants.length === 0
  ) {
    res.status(400).json({
      success: false,
      message: 'Title and participants are required.',
    });
    return;
  }

  next();
};

export const validateMessageCreation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Message content is required.',
    });
    return;
  }

  next();
};

// middlewares/validationMiddleware.js

export const validateBattleCreation = (req, res, next) => {
  const { title, description, topic, difficulty } = req.body;

  if (!title || !description || !topic || !difficulty) {
    return res.status(400).json({
      success: false,
      message: "Title, description, topic, and difficulty are required.",
    });
  }

  // Add more validation rules as needed

  next();
};

export const validateChatCreation = (req, res, next) => {
  const { title, participants } = req.body;

  if (
    !title ||
    !participants ||
    !Array.isArray(participants) ||
    participants.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Title and participants are required.",
    });
  }

  // Add more validation rules as needed

  next();
};

export const validateMessageCreation = (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      message: "Message content is required.",
    });
  }

  // Add more validation rules as needed

  next();
};

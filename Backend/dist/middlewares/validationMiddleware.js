"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMessageCreation = exports.validateChatCreation = exports.validateBattleCreation = void 0;
const validateBattleCreation = (req, res, next) => {
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
exports.validateBattleCreation = validateBattleCreation;
const validateChatCreation = (req, res, next) => {
    const { title, participants } = req.body;
    if (!title ||
        !participants ||
        !Array.isArray(participants) ||
        participants.length === 0) {
        res.status(400).json({
            success: false,
            message: 'Title and participants are required.',
        });
        return;
    }
    next();
};
exports.validateChatCreation = validateChatCreation;
const validateMessageCreation = (req, res, next) => {
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
exports.validateMessageCreation = validateMessageCreation;
//# sourceMappingURL=validationMiddleware.js.map
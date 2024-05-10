import { logger } from './../helpers/logger';

export const getChats = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}

export const getChat = (req, res) => {
    try{
        const chatId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}

export const createChat = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}

export const createMessage = (req, res) => {
    try{
        const chatId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}

export const deleteChat = (req, res) => {
    try{
        const chatId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}
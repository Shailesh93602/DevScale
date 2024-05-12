import { logger } from './../helpers/logger.js';

export const getForums = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}

export const getForum = (req, res) => {
    try{
        const forumId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}

export const createForum = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}

export const updateForum = (req, res) => {
    try{
        const forumId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}

export const deleteForum = (req, res) => {
    try{
        const forumId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server error' });
    }
}
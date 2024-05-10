import { logger } from "../helpers/logger";

export const getQuestions = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const submitQuestions = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
import { logger } from '../helpers/logger.js';

export const getLeaderBoard = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

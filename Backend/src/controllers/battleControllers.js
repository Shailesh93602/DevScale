import { logger } from './../helpers/logger.js';

export const getBattles = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
} 

export const getBattle = (req, res) => {
    try{
        const battleId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
export const createChallenge = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
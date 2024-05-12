import { logger } from "../helpers/logger.js";

export const getRoadMaps = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const getRoadMap = (req, res) => {
    try{
        const roadMapId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const createRoadMap = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const updateRoadMap = (req, res) => {
    try{
        const roadMapId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const deleteRoadMap = (req, res) => {
    try{
        const roadMapId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
import { logger } from './../helpers/logger';

export const getJobs = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const getJob = (req, res) => {
    try{
        const jobId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const createJob = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const updateJob = (req, res) => {
    try{
        const jobId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const deleteJob = (req, res) => {
    try{
        const jobId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
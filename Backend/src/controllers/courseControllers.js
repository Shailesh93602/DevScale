import { logger } from './../helpers/logger';

export const getCourses = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error'});
    }
}

export const getCourse = (req, res) => {
    try{
        const courseId = req.params.id;
    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error'});
    }
}

export const enrollCourse = (req, res) => {
    try{

    } catch(error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error'});
    }
}
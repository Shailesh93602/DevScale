"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const prisma = new client_1.PrismaClient();
class CourseController {
    getCourses = (0, utils_1.catchAsync)(async (req, res) => {
        const courses = await prisma.course.findMany({
            orderBy: { created_at: 'asc' },
        });
        return (0, apiResponse_1.sendResponse)(res, 'COURSES_FETCHED', { data: { courses } });
    });
    getCourse = (0, utils_1.catchAsync)(async (req, res) => {
        const courseId = req.params.id;
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            return (0, apiResponse_1.sendResponse)(res, 'COURSE_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'COURSE_FETCHED', { data: { course } });
    });
    enrollCourse = (0, utils_1.catchAsync)(async (req, res) => {
        // TODO: implement this method
        // const courseId = req.params.id;
        // const userId = req.user.id;
        // const enrollment = await prisma.enrollment.findFirst({
        //   where: { userId, courseId },
        // });
        // if (enrollment) {
        //   return sendResponse(res, 'COURSE_ALREADY_ENROLLED');
        // }
        // await prisma.enrollment.create({
        //   data: { userId, courseId },
        // });
        return (0, apiResponse_1.sendResponse)(res, 'COURSE_ENROLLED');
    });
}
exports.default = CourseController;
//# sourceMappingURL=courseControllers.js.map
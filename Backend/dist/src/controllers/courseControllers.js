"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollCourse = exports.getCourse = exports.getCourses = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const prisma = new client_1.PrismaClient();
exports.getCourses = (0, utils_1.catchAsync)(async (req, res) => {
    const courses = await prisma.course.findMany({
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({ success: true, courses });
});
exports.getCourse = (0, utils_1.catchAsync)(async (req, res) => {
    const courseId = req.params.id;
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });
    if (!course) {
        return res
            .status(404)
            .json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, course });
});
exports.enrollCourse = (0, utils_1.catchAsync)(async (req, res) => {
    // TODO: implement this method
    // const courseId = req.params.id;
    // const userId = req.user.id;
    // const enrollment = await prisma.enrollment.findFirst({
    //   where: { userId, courseId },
    // });
    // if (enrollment) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: 'Already enrolled in this course' });
    // }
    // await prisma.enrollment.create({
    //   data: { userId, courseId },
    // });
    res
        .status(201)
        .json({ success: true, message: 'Enrolled in course successfully!' });
});
//# sourceMappingURL=courseControllers.js.map
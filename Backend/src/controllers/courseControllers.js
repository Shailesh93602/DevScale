import { logger } from "./../helpers/logger.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await findAllCourses();
    res.status(200).json({ success: true, courses });
  } catch (error) {
    logger.error("Error fetching courses:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await findCourseById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    logger.error("Error fetching course:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Check if user is already enrolled
    const isEnrolled = await checkEnrollment(userId, courseId);
    if (isEnrolled) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this course" });
    }

    await enrollInCourse(userId, courseId);
    res
      .status(201)
      .json({ success: true, message: "Enrolled in course successfully!" });
  } catch (error) {
    logger.error("Error enrolling in course:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

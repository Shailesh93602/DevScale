import { predictCareerPath } from "../services/predictionService.js";

const predict = async (req, res) => {
  try {
    const inputData = req.body;
    const careerPath = predictCareerPath(inputData);
    res.status(200).json({ careerPath });
  } catch (error) {
    console.error("Error in predict controller:", error);
    res
      .status(500)
      .json({ message: "Error predicting career path", error: error.message });
  }
};

export { predict };

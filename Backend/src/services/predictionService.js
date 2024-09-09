import fs from "fs";
import { Matrix } from "ml-matrix";

const preprocessInput = (input) => {
  try {
    if (!input || typeof input !== "object") {
      throw new Error("Invalid input structure");
    }

    const processedInput = {
      ...input,
      age: parseFloat(input.age),
      gpa: parseFloat(input.gpa),
    };

    if (isNaN(processedInput.age) || isNaN(processedInput.gpa)) {
      throw new Error("Invalid age or GPA format");
    }

    return processedInput;
  } catch (error) {
    console.error("Error preprocessing input:", error);
    throw error;
  }
};

const predictCareerPath = (inputData) => {
  try {
    const preprocessedInput = preprocessInput(inputData);

    const inputMatrix = new Matrix([Object.values(preprocessedInput)]);

    const prediction = model.predict(inputMatrix);

    return prediction[0];
  } catch (error) {
    console.error("Error predicting career path:", error);
    throw error;
  }
};

export { predictCareerPath };

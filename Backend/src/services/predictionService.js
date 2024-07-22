import fs from "fs";
import { Matrix } from "ml-matrix";
import { LabelEncoder } from "./labelEncoder.js";

// Custom Logistic Regression class
// class CustomLogisticRegression {
//   constructor(weights, intercept) {
//     this.weights = new Matrix(weights);
//     this.intercept = intercept;
//   }

//   predict(X) {
//     const z = X.mmul(this.weights.transpose()).add(this.intercept);
//     return z
//       .to1DArray()
//       .map((value) => (1 / (1 + Math.exp(-value)) > 0.5 ? 1 : 0)); // Sigmoid function and thresholding
//   }
// }

// Load the model data
let modelData;
try {
  // modelData = JSON.parse(fs.readFileSync("src/models/model.json", "utf8"));
} catch (error) {
  console.error("Error reading model data:", error);
}

let model;
try {
  // model = new CustomLogisticRegression(modelData.weights, modelData.intercept);
} catch (error) {
  console.error("Error initializing model:", error);
}

// Load label encoders and scaler
let labelEncoders, scaler;
try {
  labelEncoders = JSON.parse(
    fs.readFileSync("src/models/labelEncoders.json", "utf8")
  );
  scaler = JSON.parse(fs.readFileSync("src/models/scaler.json", "utf8"));
} catch (error) {
  console.error("Error reading encoders or scaler:", error);
}

const featureColumns = [
  "age",
  "gender",
  "branch",
  "year",
  "gpa",
  "favoriteTechDomain",
  "coreInterest",
  "environmentPreference",
];

const preprocessInput = (input) => {
  try {
    // Validate input structure
    if (!input || typeof input !== "object") {
      throw new Error("Invalid input structure");
    }

    // Convert age and gpa to numeric types
    const processedInput = {
      ...input,
      age: parseFloat(input.age),
      gpa: parseFloat(input.gpa),
    };

    // Validate numeric conversions
    if (isNaN(processedInput.age) || isNaN(processedInput.gpa)) {
      throw new Error("Invalid age or GPA format");
    }

    // Apply label encoding
    Object.keys(labelEncoders).forEach((key) => {
      if (key in processedInput) {
        const le = new LabelEncoder();
        le.fit(labelEncoders[key]);
        processedInput[key] = le.transform([processedInput[key]])[0];
      }
    });

    // Apply scaling or any other preprocessing steps here

    // Example: scaling age and gpa if needed

    // Return final processed input
    return processedInput;
  } catch (error) {
    console.error("Error preprocessing input:", error);
    throw error;
  }
};

const predictCareerPath = (inputData) => {
  try {
    const preprocessedInput = preprocessInput(inputData);

    // Ensure preprocessedInput is a 2D array
    const inputMatrix = new Matrix([Object.values(preprocessedInput)]);

    const prediction = model.predict(inputMatrix);

    return prediction[0];
  } catch (error) {
    console.error("Error predicting career path:", error);
    throw error;
  }
};

export { predictCareerPath };

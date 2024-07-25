import { body, validationResult } from "express-validator";

// Validation rules for user profile insertion
export const userInsertionValidator = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("dob").isDate().withMessage("Date of birth must be a valid date"),
  body("gender")
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be either male, female, or other"),
  body("mobile")
    .isMobilePhone()
    .withMessage("Mobile number must be a valid phone number"),
  body("address").notEmpty().withMessage("Address is required"),
  body("university").notEmpty().withMessage("University is required"),
  body("college").notEmpty().withMessage("College is required"),
  body("branch").notEmpty().withMessage("Branch is required"),
  body("semester")
    .isInt({ min: 1, max: 8 })
    .withMessage("Semester must be between 1 and 8"),

  // Handle validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

import { body } from "express-validator";

export const registerValidator = [
//   body("role_id").isBoolean().withMessage("Access Denied"),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Name must be of 3 characters long.")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name must be alphabetic."),
  body("email")
    .isByteLength({ min: 6 })
    .withMessage("Please provide a valid email address")
    .isEmail()
    .withMessage("Invalid email...!!")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 character long...!!"),
];


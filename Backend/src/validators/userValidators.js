import { body } from "express-validator";

export const userInsertionValidator = [
    body("fullName")
        .isLength({ min: 3 })
        .withMessage("Name must be of 3 characters long."),
    body("email")
        .isByteLength({ min: 6 })
        .withMessage("Please provide a valid email address")
        .isEmail()
        .withMessage("Invalid email...!!")
        .normalizeEmail(),
    body("dob")
        .isByteLength({ min: 6 })
        .withMessage("Please provide a valid date of birth")
        .isDate()
        .withMessage("Invalid date of birth...!!"),
    body("gender")
        .isString()
        .withMessage("Please provide a valid gender")
        .isIn(['male', 'female'])
        .withMessage("Please provide a valid gender"),
    body("mobile")
        .isNumeric()
        .withMessage("Please provide a valid mobile number")
        .isByteLength({ min: 10, max: 10 })
        .withMessage("Please provide a valid mobile number"),
    body("whatsapp")
        .isNumeric()
        .withMessage("Please provide a valid whatsapp number")
        .isByteLength({ min: 10, max: 10 })
        .withMessage("Please provide a valid whatsapp number"),
    body("university")
        .exists()
        .withMessage("Please provide a university name"),
    body("college")
        .exists()
        .withMessage("Please provide a college name"),
    body("branch")
        .exists()
        .withMessage("Please provide a branch"),
    body("semester")
        .isNumeric()
        .withMessage("Please provide a valid semester")
];
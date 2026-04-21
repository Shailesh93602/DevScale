import * as yup from 'yup';
import { phone } from 'phone';

// Base reusable schemas
export const emailSchema = yup
  .string()
  .required('Email is required')
  .trim()
  .lowercase()
  .email('Invalid email format')
  .max(100, 'Email must be less than 100 characters');

export const passwordSchema = (fieldName = 'Password') =>
  yup
    .string()
    .required(`${fieldName} is required`)
    .min(8, `${fieldName} must be at least 8 characters`)
    .max(64, `${fieldName} must be less than 64 characters`)
    .matches(/[A-Z]/, `${fieldName} must contain at least one uppercase letter`)
    .matches(/[a-z]/, `${fieldName} must contain at least one lowercase letter`)
    .matches(/\d/, `${fieldName} must contain at least one number`)
    .matches(
      /[^\w]/,
      `${fieldName} must contain at least one special character`,
    );

export const mobileSchema = yup
  .string()
  .required('Mobile number is required')
  .test('valid-phone', 'Invalid phone number', (value) =>
    value ? phone(value, { country: 'IN' }).isValid : false,
  );

// Custom validation methods
yup.addMethod(yup.string, 'username', function () {
  return this.required('Username required')
    .min(8, 'Username must be at least 8 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9/!@#$%^&*])/,
      'Username must contain uppercase, lowercase, and a number or special character',
    );
});

yup.addMethod(yup.string, 'conditionalRequired', function (message, condition) {
  return this.when(condition, {
    is: true,
    then: (schema) => schema.required(message),
    otherwise: (schema) => schema.notRequired(),
  });
});

// Composite schemas
export const loginSchema = yup.object({
  email: emailSchema,
  // Login only needs the password to be present — the server validates correctness.
  // Using passwordSchema() here leaks complexity rules to the user unnecessarily.
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  first_name: yup
    .string()
    .required('First name is required')
    .max(50, 'First name must be less than 50 characters'),
  last_name: yup
    .string()
    .required('Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: emailSchema,
  password: passwordSchema(),
  // Order matters: .required() fires first so an empty submit shows
  // "Confirm Password is required" (not the confusing "Passwords must match"
  // when both fields are empty strings). .test() only compares when both
  // values are present, matching user-intuited validation order.
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .test('passwords-match', 'Passwords must match', function (value) {
      const { password } = this.parent as { password?: string };
      if (!value || !password) return true; // required-error owns the empty case
      return value === password;
    }),
});

export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});

export const resetPasswordSchema = yup.object({
  password: passwordSchema('New password'),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .test('passwords-match', 'Passwords must match', function (value) {
      const { password } = this.parent as { password?: string };
      if (!value || !password) return true;
      return value === password;
    }),
});

export const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  dob: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  mobile: mobileSchema,
  university: yup.string().when('$isStudent', {
    is: true,
    then: (schema) => schema.required('University is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  college: yup.string().when('$isStudent', {
    is: true,
    then: (schema) => schema.required('College is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  branch: yup.string().when('$isStudent', {
    is: true,
    then: (schema) => schema.required('Branch is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  semester: yup.string().when('$isStudent', {
    is: true,
    then: (schema) => schema.required('Semester is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  experienceLevel: yup.string().required('Experience level is required'),
  skills: yup
    .array()
    .of(yup.string().required())
    .min(3, 'Select at least 3 skills')
    .max(10, 'Maximum 10 skills allowed'),
});

export const detailsSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  username: yup
    .string()
    .required('Username is required')
    .min(8, 'Username must be at least 8 characters')
    .max(30, 'Username cannot be longer than 30 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9/!@#$%^&*])/,
      'Username must contain uppercase, lowercase, and numeric/special characters',
    ),
  bio: yup.string().defined(),
  avatarUrl: yup.string().url('Invalid Avatar URL').defined(),
  address: yup.string().defined(),
  githubUrl: yup.string().url('Invalid GitHub URL').defined(),
  linkedinUrl: yup.string().url('Invalid LinkedIn URL').defined(),
  twitterUrl: yup.string().url('Invalid Twitter URL').defined(),
  websiteUrl: yup.string().url('Invalid Website URL').defined(),
  specialization: yup.string().defined(),
  college: yup.string().defined(),
  graduationYear: yup.number().positive().integer().defined(),
  skills: yup.array().of(yup.string().defined()).optional(),
  experienceLevel: yup
    .string()
    .oneOf(['beginner', 'intermediate', 'advanced'])
    .optional(),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
export type ProfileFormData = yup.InferType<typeof profileSchema>;

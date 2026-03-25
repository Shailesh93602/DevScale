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
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(
      /^\w+$/,
      'Username can only contain letters, numbers, and underscores',
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
  password: passwordSchema(),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('Full name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  password: passwordSchema(),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});

export const resetPasswordSchema = yup.object({
  password: passwordSchema('New password'),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const profileSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
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
  full_name: yup.string().required('Full name is required'),
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot be longer than 20 characters')
    .matches(
      /^\w+$/,
      'Username can only contain letters, numbers, and underscores',
    ),
  bio: yup.string().defined(),
  avatarUrl: yup.string().url('Invalid URL').defined(),
  address: yup.string().defined(),
  githubUrl: yup.string().url('Invalid URL').defined(),
  linkedinUrl: yup.string().url('Invalid URL').defined(),
  twitterUrl: yup.string().url('Invalid URL').defined(),
  websiteUrl: yup.string().url('Invalid URL').defined(),
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

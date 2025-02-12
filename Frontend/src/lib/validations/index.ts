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
    .matches(/[0-9]/, `${fieldName} must contain at least one number`)
    .matches(
      /[^A-Za-z0-9]/,
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
      /^[a-zA-Z0-9_]+$/,
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
  acceptTerms: yup
    .boolean()
    .required('You must accept the terms and conditions')
    .oneOf([true], 'You must accept the terms and conditions'),
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
  mobile: mobileSchema,
  university: yup.string().when('$isStudent', {
    is: true,
    then: (schema) => schema.required('University is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  experienceLevel: yup.string().required('Experience level is required'),
  skills: yup
    .array()
    .of(yup.string().required())
    .min(3, 'Select at least 3 skills')
    .max(10, 'Maximum 10 skills allowed'),
});

// Validation types
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
export type ProfileFormData = yup.InferType<typeof profileSchema>;

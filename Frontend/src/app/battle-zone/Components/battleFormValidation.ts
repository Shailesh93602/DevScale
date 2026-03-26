import * as yup from 'yup';
import { difficulties } from '@/constants';

export const battleFormSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: yup
    .string()
    .optional()
    .max(500, 'Description must be less than 500 characters'),
  difficulty: yup
    .string()
    .required('Difficulty is required')
    .oneOf(Object.values(difficulties), 'Invalid difficulty level'),
  type: yup
    .string()
    .required('Type is required')
    .oneOf(['QUICK', 'SCHEDULED', 'PRACTICE'], 'Invalid battle type'),
  maxParticipants: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .nullable()
    .default(6)
    .min(2, 'Minimum 2 participants required')
    .max(10, 'Maximum 10 participants allowed'),
  pointsPerQuestion: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .nullable()
    .default(100)
    .min(10, 'Minimum 10 points per question')
    .max(1000, 'Maximum 1000 points per question'),
  timePerQuestion: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .nullable()
    .default(30)
    .min(15, 'Minimum 15 seconds per question')
    .max(60, 'Maximum 60 seconds per question'),
  // Schedule fields (only required for SCHEDULED type)
  date: yup.string().optional(),
  time: yup.string().optional(),
});

export type BattleFormValues = yup.InferType<typeof battleFormSchema>;

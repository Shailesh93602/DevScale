import * as yup from 'yup';
import { difficulties, lengths } from '@/constants';

export const battleFormSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  subjectId: yup.string().required('Subject is required'),
  topicId: yup.string().required('Topic is required'),
  difficulty: yup
    .string()
    .required('Difficulty is required')
    .oneOf(Object.values(difficulties), 'Invalid difficulty level'),
  length: yup
    .string()
    .required('Length is required')
    .oneOf(Object.values(lengths), 'Invalid length'),
  date: yup
    .string()
    .required('Date is required')
    .test('is-future-date', 'Date must be in the future', function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  time: yup.string().required('Time is required'),
  maxParticipants: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .default(10)
    .min(2, 'Minimum 2 participants required')
    .max(100, 'Maximum 100 participants allowed'),
  pointsPerQuestion: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .default(10)
    .min(1, 'Minimum 1 point per question')
    .max(100, 'Maximum 100 points per question'),
  timePerQuestion: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .default(30)
    .min(10, 'Minimum 10 seconds per question')
    .max(600, 'Maximum 600 seconds (10 minutes) per question'),
  totalQuestions: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .default(10)
    .min(1, 'Minimum 1 question required')
    .max(50, 'Maximum 50 questions allowed'),
});

export type BattleFormValues = yup.InferType<typeof battleFormSchema>;

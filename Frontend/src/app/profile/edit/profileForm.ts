import * as z from 'zod';

export const profileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50),
  last_name: z
    .string()
    .min(1, 'Last name must be at least 1 character')
    .max(50),
  username: z
    .string()
    .min(3, 'Username is not available')
    .max(30, 'Username is not available')
    .regex(/^[a-z0-9_]+$/, 'Username is not available'),
  email: z.string().email('Invalid email address'),
  specialization: z.string().optional().or(z.literal('')),
  experience_level: z.string().optional().or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  skills: z.string().optional().or(z.literal('')),
  college: z.string().optional().or(z.literal('')),
  graduation_year: z.preprocess(
    (val) =>
      val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().min(1900).max(2100).optional(),
  ),
  github_url: z
    .string()
    .url('Invalid URL format')
    .regex(
      /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
      'Invalid GitHub profile URL',
    )
    .optional()
    .or(z.literal('')),
  linkedin_url: z
    .string()
    .url('Invalid URL format')
    .regex(
      /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/,
      'Invalid LinkedIn profile URL',
    )
    .optional()
    .or(z.literal('')),
  twitter_url: z
    .string()
    .url('Invalid URL format')
    .regex(
      /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-z0-9_]+\/?$/i,
      'Invalid X/Twitter profile URL',
    )
    .optional()
    .or(z.literal('')),
  website_url: z
    .string()
    .url('Invalid Website URL')
    .optional()
    .or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  note: z
    .string()
    .max(200, 'Note cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  avatar_url?: string;
  username: string;
  email: string;
  bio?: string;
  note?: string;
  address?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  specialization?: string;
  college?: string;
  graduation_year?: number;
  skills?: string[];
  experience_level?: string;
}

export const EMPTY_PROFILE_FORM: ProfileFormValues = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  specialization: '',
  experience_level: '',
  bio: '',
  skills: '',
  college: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  website_url: '',
  address: '',
  note: '',
};

export function profileToFormValues(userData: UserProfile): ProfileFormValues {
  return {
    first_name: userData.first_name || '',
    last_name: userData.last_name || '',
    username: userData.username || '',
    email: userData.email || '',
    specialization: userData.specialization || '',
    experience_level: userData.experience_level || '',
    bio: userData.bio || '',
    skills: userData.skills?.join(', ') || '',
    college: userData.college || '',
    graduation_year: userData.graduation_year,
    github_url: userData.github_url || '',
    linkedin_url: userData.linkedin_url || '',
    twitter_url: userData.twitter_url || '',
    website_url: userData.website_url || '',
    address: userData.address || '',
    note: userData.note || '',
  };
}

export function formValuesToPayload(values: ProfileFormValues) {
  // Never send an id: the server must take identity from the session. (`email` stays until the
  // backend's userInsertionSchema stops requiring it, or every save would 400.)
  const { id: _id, ...editable } = values as ProfileFormValues & {
    id?: unknown;
  };
  void _id;
  return {
    ...editable,
    skills: values.skills
      ? values.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    graduation_year: values.graduation_year || null,
  };
}

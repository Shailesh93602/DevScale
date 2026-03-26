'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Globe,
  GraduationCap,
  Briefcase,
  User,
  Mail,
  MapPin,
  Pencil,
  CheckCircle2,
  XCircle,
  Loader2,
  Code2,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAxiosGet, useAxiosPut } from '@/hooks/useAxios';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { ProfileSkeleton } from '../components/ProfileSkeleton';
import { toast } from 'sonner';

const profileSchema = z.object({
  first_name: z
    .string()
    .min(2, { error: 'First name must be at least 2 characters' })
    .max(50),
  last_name: z
    .string()
    .min(1, { error: 'Last name must be at least 1 character' })
    .max(50),
  username: z.string()
    .min(3, { error: 'Username is not available' })
    .max(30, { error: 'Username is not available' })
    .regex(/^[a-z0-9_]+$/, { error: 'Username is not available' }),
  email: z.email({ error: 'Invalid email address' }),
  specialization: z.string().optional().or(z.literal('')),
  experience_level: z.string().optional().or(z.literal('')),
  bio: z
    .string()
    .max(500, { error: 'Bio cannot exceed 500 characters' })
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
    .url({ error: 'Invalid URL format' })
    .regex(
      /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
      { error: 'Invalid GitHub profile URL' },
    )
    .optional()
    .or(z.literal('')),
  linkedin_url: z
    .url({ error: 'Invalid URL format' })
    .regex(
      /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/,
      { error: 'Invalid LinkedIn profile URL' },
    )
    .optional()
    .or(z.literal('')),
  twitter_url: z
    .url({ error: 'Invalid URL format' })
    .regex(
      /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-z0-9_]+\/?$/i,
      { error: 'Invalid X/Twitter profile URL' },
    )
    .optional()
    .or(z.literal('')),
  website_url: z.url({ error: 'Invalid Website URL' })
    .optional()
    .or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  note: z
    .string()
    .max(200, { error: 'Note cannot exceed 200 characters' })
    .optional()
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfile {
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

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'error'
  >('idle');

  const [getProfile] = useAxiosGet<{ user: UserProfile }>('/users/me');
  const [updateProfile] = useAxiosPut<{ success?: boolean; message?: string }>(
    '/users/me',
  );
  const [getUsernameCheck] = useAxiosGet<boolean>('/users/check-username');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
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
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success && response.data) {
          const userData = response.data.user ?? response.data;
          setProfile(userData);
          form.reset({
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
          });
        }
      } catch (err) {
        logger.error('Error fetching profile:', err);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [getProfile, form]);

  const watchUsername = form.watch('username');
  const debouncedUsername = useDebounce(watchUsername, 500);

  useEffect(() => {
    const checkUsername = async (username: string) => {
      if (!username || username.trim() === '') {
        setUsernameStatus('idle');
        return;
      }

      if (!profile || username === profile.username) {
        setUsernameStatus('available');
        return;
      }

      // First check if FE validation passes
      const result = profileSchema.shape.username.safeParse(username);
      if (!result.success) {
        setUsernameStatus('taken'); // Show as not available if format is wrong
        form.setError('username', {
          type: 'manual',
          message: 'Username is not available',
        });
        return;
      }

      setUsernameStatus('checking');
      try {
        const response = await getUsernameCheck({ params: { username } });
        if (response.success && response.data !== null) {
          const available = response.data;
          setUsernameStatus(available ? 'available' : 'taken');
          if (available) {
            form.clearErrors('username');
          } else {
            form.setError('username', {
              type: 'manual',
              message: 'Username is not available',
            });
          }
        } else {
          setUsernameStatus('error');
        }
      } catch (err) {
        logger.error('Error checking username:', err);
        setUsernameStatus('error');
      }
    };

    if (debouncedUsername === undefined) {
      setUsernameStatus('idle');
      form.clearErrors('username');
    } else {
      // Clear errors first before format check
      form.clearErrors('username');
      checkUsername(debouncedUsername);
    }
  }, [debouncedUsername, getUsernameCheck, profile]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (usernameStatus === 'taken') {
      form.setError('username', { message: 'Username is already taken' });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProfilePayload = {
        ...values,
        skills: values.skills
          ? values.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        graduation_year: values.graduation_year || null,
      };

      const response = await updateProfile(updatedProfilePayload);
      if (response?.success) {
        toast.success('Profile updated successfully');
        router.push('/profile');
      } else {
        toast.error(response?.message || 'Failed to update profile');
      }
    } catch (err) {
      logger.error('Error in profile update submission:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-primary/10 group gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Profile
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Profile
          </h1>
        </div>

        <Card className="overflow-hidden border-none bg-card shadow-xl ring-1 ring-border/50">
          <CardHeader className="from-primary/10 border-b border-border/50 bg-gradient-to-r via-purple-500/5 to-transparent p-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-2xl p-3 text-primary shadow-inner">
                <Pencil className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Your Identity
                </CardTitle>
                <CardDescription className="mt-1 text-balance text-lg text-muted-foreground">
                  Update your professional profile and digital presence.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-0 text-balance"
              >
                <div className="space-y-12 p-8">
                  {/* SECTION: BASIC IDENTITY */}
                  <section className="space-y-8">
                    <div className="text-primary/80 flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                      <User className="h-5 w-5" />
                      <span>Basic Identity</span>
                      <div className="from-primary/20 ml-2 h-[1px] flex-1 bg-gradient-to-r to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                className={cn(
                                  'h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-all focus:bg-background',
                                  form.formState.errors.first_name &&
                                    'border-red-500 focus-visible:ring-red-500',
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                className={cn(
                                  'h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-all focus:bg-background',
                                  form.formState.errors.last_name &&
                                    'border-red-500 focus-visible:ring-red-500',
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              Username
                            </FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  placeholder="johndoe_99"
                                  className={cn(
                                    'h-12 rounded-xl border-border/40 bg-muted/20 px-4 pr-12 font-medium transition-all focus:bg-background',
                                    usernameStatus === 'available' &&
                                      'border-green-500/50 focus-visible:ring-green-500/20',
                                    usernameStatus === 'taken' &&
                                      'border-red-500/50 focus-visible:ring-red-500/20',
                                  )}
                                  {...field}
                                />
                              </FormControl>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {usernameStatus === 'checking' && (
                                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                )}
                                {usernameStatus === 'available' && (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 duration-300 animate-in zoom-in" />
                                )}
                                {usernameStatus === 'taken' && (
                                  <XCircle className="text-red-500 h-5 w-5 duration-300 animate-in zoom-in" />
                                )}
                              </div>
                            </div>
                            <FormDescription className="ml-1 mt-2 min-h-[0.5rem] text-xs">
                              {usernameStatus === 'available' && (
                                <span className="font-bold text-green-600">
                                  Username is available!
                                </span>
                              )}
                            </FormDescription>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              Email Address
                            </FormLabel>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                              <FormControl>
                                <Input
                                  placeholder="john@example.com"
                                  className="h-12 rounded-xl border-border/40 bg-muted/20 pl-12 transition-all focus:bg-background"
                                  {...field}
                                  disabled
                                />
                              </FormControl>
                            </div>
                            <FormDescription className="ml-1 mt-1 text-xs opacity-70">
                              Email cannot be changed for security reasons.
                            </FormDescription>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator className="bg-border/40" />

                  {/* SECTION: PROFESSIONAL PROFILE */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-blue-500/80">
                      <Briefcase className="h-5 w-5" />
                      <span>Professional Profile</span>
                      <div className="ml-2 h-[1px] flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              Specialization / Role
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Full Stack Developer"
                                className={cn(
                                  'h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-all focus:bg-background',
                                  form.formState.errors.specialization &&
                                    'border-red-500 focus-visible:ring-red-500',
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="experience_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              Experience Level
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    'h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-all focus:bg-background',
                                    form.formState.errors.experience_level &&
                                      'border-red-500 focus-visible:ring-red-500',
                                  )}
                                >
                                  <SelectValue placeholder="Select your's" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">
                                  Beginner
                                </SelectItem>
                                <SelectItem value="intermediate">
                                  Intermediate
                                </SelectItem>
                                <SelectItem value="advanced">
                                  Advanced
                                </SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ml-1 font-bold text-foreground/90">
                            About Yourself (Bio)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Briefly describe your journey, passion, and what you're building..."
                              className={cn(
                                'min-h-[160px] resize-none rounded-xl border-border/40 bg-muted/20 p-4 leading-relaxed transition-all focus:bg-background',
                                form.formState.errors.bio &&
                                  'border-red-500 focus-visible:ring-red-500',
                              )}
                              {...field}
                            />
                          </FormControl>
                          <div className="mt-1 flex justify-end pr-2">
                            <span
                              className={cn(
                                'font-mono text-xs',
                                (field.value?.length || 0) > 450
                                  ? 'text-orange-500'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {field.value?.length || 0} / 500
                            </span>
                          </div>
                          <FormMessage className="text-red-500 ml-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ml-1 flex items-center gap-2 font-bold text-foreground/90">
                            <Code2 className="h-4 w-4" />
                            Skills (comma-separated)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="React, TypeScript, Node.js, AWS..."
                              className={cn(
                                'h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-all focus:bg-background',
                                form.formState.errors.skills &&
                                  'border-red-500 focus-visible:ring-red-500',
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="ml-1 mt-2 text-xs">
                            List your top technical skills to stand out.
                          </FormDescription>
                          <FormMessage className="text-red-500 ml-1" />
                        </FormItem>
                      )}
                    />
                  </section>

                  <Separator className="bg-border/40" />

                  {/* SECTION: ACADEMIC HISTORY */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-green-600/80">
                      <GraduationCap className="h-5 w-5" />
                      <span>Academic History</span>
                      <div className="ml-2 h-[1px] flex-1 bg-gradient-to-r from-green-600/20 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="college"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              University / College
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="IIT Delhi, Stanford University..."
                                className={cn(
                                  'h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-all focus:bg-background',
                                  form.formState.errors.college &&
                                    'border-red-500 focus-visible:ring-red-500',
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="graduation_year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              Graduation Year
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2025"
                                className={cn(
                                  'h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-all focus:bg-background',
                                  form.formState.errors.graduation_year &&
                                    'border-red-500 focus-visible:ring-red-500',
                                )}
                                {...field}
                                value={field.value || ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number.parseInt(e.target.value)
                                      : undefined,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator className="bg-border/40" />

                  {/* SECTION: ONLINE PRESENCE */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-orange-500/80">
                      <Globe className="h-5 w-5" />
                      <span>Online Presence</span>
                      <div className="ml-2 h-[1px] flex-1 bg-gradient-to-r from-orange-500/20 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="github_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              GitHub URL
                            </FormLabel>
                            <div className="relative">
                              <FaGithub className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                              <FormControl>
                                <Input
                                  placeholder="https://github.com/username"
                                  className={cn(
                                    'h-12 rounded-xl border-border/40 bg-muted/20 pl-12 transition-all focus:bg-background',
                                    form.formState.errors.github_url &&
                                      'border-red-500 focus-visible:ring-red-500',
                                  )}
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedin_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              LinkedIn URL
                            </FormLabel>
                            <div className="relative">
                              <FaLinkedin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                              <FormControl>
                                <Input
                                  placeholder="https://linkedin.com/in/username"
                                  className={cn(
                                    'h-12 rounded-xl border-border/40 bg-muted/20 pl-12 transition-all focus:bg-background',
                                    form.formState.errors.linkedin_url &&
                                      'border-red-500 focus-visible:ring-red-500',
                                  )}
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="twitter_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              X (Twitter) URL
                            </FormLabel>
                            <div className="relative">
                              <FaXTwitter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                              <FormControl>
                                <Input
                                  placeholder="https://x.com/username"
                                  className={cn(
                                    'h-12 rounded-xl border-border/40 bg-muted/20 pl-12 transition-all focus:bg-background',
                                    form.formState.errors.twitter_url &&
                                      'border-red-500 focus-visible:ring-red-500',
                                  )}
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="ml-1 font-bold text-foreground/90">
                              Personal Website
                            </FormLabel>
                            <div className="relative">
                              <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                              <FormControl>
                                <Input
                                  placeholder="https://yourwebsite.com"
                                  className={cn(
                                    'h-12 rounded-xl border-border/40 bg-muted/20 pl-12 transition-all focus:bg-background',
                                    form.formState.errors.website_url &&
                                      'border-red-500 focus-visible:ring-red-500',
                                  )}
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-red-500 ml-1" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator className="bg-border/40" />

                  {/* SECTION: ADDITIONAL DETAILS */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>Additional Details</span>
                      <div className="ml-2 h-[1px] flex-1 bg-gradient-to-r from-muted-foreground/20 to-transparent" />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ml-1 font-bold text-foreground/90">
                            Location / Address
                          </FormLabel>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                            <FormControl>
                              <Input
                                placeholder="City, Country"
                                className={cn(
                                  'h-12 rounded-xl border-border/40 bg-muted/20 pl-12 transition-all focus:bg-background',
                                  form.formState.errors.address &&
                                    'border-red-500 focus-visible:ring-red-500',
                                )}
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-red-500 ml-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="ml-1 font-bold text-foreground/90">
                            Personal Note / Life Motto
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A short punchy line that defines you..."
                              className={cn(
                                'min-h-[100px] resize-none rounded-xl border-border/40 bg-muted/20 p-4 leading-relaxed transition-all focus:bg-background',
                                form.formState.errors.note &&
                                  'border-red-500 focus-visible:ring-red-500',
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 ml-1" />
                        </FormItem>
                      )}
                    />
                  </section>
                </div>

                <div className="sticky bottom-0 z-10 flex flex-col justify-end gap-4 rounded-b-3xl border-t border-border/50 bg-background/80 p-8 backdrop-blur-md sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-12 rounded-xl border-border/40 px-8 font-medium transition-all hover:bg-muted/50"
                    disabled={isSubmitting}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="submit"
                    className="hover:bg-primary/90 shadow-primary/20 h-12 gap-3 rounded-xl bg-primary px-12 text-lg font-bold text-primary-foreground shadow-xl transition-all active:scale-[0.98]"
                    disabled={
                      isSubmitting ||
                      usernameStatus === 'checking' ||
                      usernameStatus === 'taken'
                    }
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    Save Profile
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

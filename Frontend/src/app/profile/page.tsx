'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Calendar,
  Github,
  Linkedin,
  Twitter,
  Globe,
  GraduationCap,
  BookOpen,
  Award,
  Zap,
  MapPin,
  Edit3,
  ExternalLink,
  Code2,
  Briefcase,
  IdCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAxiosGet } from '@/hooks/useAxios';
import { logger } from '@/lib/logger';
import { ProfileSkeleton } from './components/ProfileSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
  memberSince?: string;
  created_at?: string;
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
  learning_streak?: number;
  user_points?: {
    points: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [getProfile] = useAxiosGet<UserProfile>('/users/me');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProfile();

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err) {
      logger.error('Error fetching profile:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto p-4 py-12">
        <ErrorState
          fullPage
          title="Could not load profile"
          message={
            error || 'Failed to load your profile data. Please try again.'
          }
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  const name = profile.first_name
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
    : 'Incognito User';
  const avatar = profile.avatar_url || profile.avatar;
  const memberSinceDate = profile.created_at || profile.memberSince;

  const formattedDate = (() => {
    if (!memberSinceDate) return 'Recently';
    const date = new Date(memberSinceDate);
    return isNaN(date.getTime())
      ? 'Recently'
      : date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  })();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background/50 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl"
      >
        {/* Header / Hero Section */}
        <Card className="overflow-hidden border border-border/50 bg-card shadow-xl">
          <div className="relative h-56 w-full overflow-hidden">
            {/* Background Transitions - Professional & Clean */}
            <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#020617]" />
            <div className="from-indigo-500/10 to-primary/5 dark:from-primary/20 absolute inset-0 bg-gradient-to-br via-transparent dark:via-transparent dark:to-transparent" />

            {/* Professional Grid/Dot Pattern - Light/Dark Optimized */}
            <div
              className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1.5px 1.5px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Subtle Gradient Glow in corners - Light/Dark Optimized */}
            <div className="bg-indigo-500/5 dark:bg-primary/20 absolute -left-1/4 -top-1/2 h-[150%] w-[100%] blur-[120px]" />
            <div className="bg-primary/5 dark:bg-purple-500/10 absolute -bottom-1/2 -right-1/4 h-[150%] w-[100%] blur-[100px]" />

            {/* Bottom Divider */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-border/50 dark:bg-white/10" />
          </div>

          <CardContent className="relative -mt-16 pb-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-[6px] border-card shadow-xl ring-1 ring-border/20">
                    <AvatarImage
                      src={avatar}
                      alt={name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-3xl font-black text-white">
                      {name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Link href="/profile/edit">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-1 right-1 h-9 w-9 rounded-full border-2 border-card shadow-lg transition-all duration-300 hover:bg-primary hover:text-white"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-1 pt-4 sm:pt-0">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 font-medium text-muted-foreground">
                    <span>@{profile.username}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>
                        {profile.specialization || 'Engineering Enthusiast'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/profile/edit">
                  <Button
                    size="lg"
                    className="gap-2 rounded-xl px-8 font-bold shadow-md transition-all hover:shadow-lg"
                  >
                    <Edit3 className="h-5 w-5" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                {
                  icon: <Zap className="h-5 w-5 text-amber-500" />,
                  value: profile.learning_streak || 0,
                  label: 'Day Streak',
                  borderColor: 'border-amber-500/20',
                  iconBg: 'bg-amber-500/10',
                },
                {
                  icon: <Award className="text-indigo-500 h-5 w-5" />,
                  value: profile.user_points?.points || 0,
                  label: 'XP Points',
                  borderColor: 'border-indigo-500/20',
                  iconBg: 'bg-indigo-500/10',
                },
                {
                  icon: <IdCard className="h-5 w-5 text-emerald-500" />,
                  value: profile.experience_level || 'Beginner',
                  label: 'Level',
                  borderColor: 'border-emerald-500/20',
                  iconBg: 'bg-emerald-500/10',
                },
                {
                  icon: <Calendar className="h-5 w-5 text-rose-500" />,
                  value: formattedDate,
                  label: 'Joined',
                  borderColor: 'border-rose-500/20',
                  iconBg: 'bg-rose-500/10',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-2xl p-5 text-center transition-all duration-300',
                    'border-2 bg-zinc-100/50 dark:bg-zinc-900/50',
                    'hover:scale-[1.02] hover:shadow-xl',
                    stat.borderColor,
                  )}
                >
                  <div
                    className={cn(
                      'mb-3 rounded-xl p-2.5 shadow-inner',
                      stat.iconBg,
                    )}
                  >
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-black tracking-tight text-foreground">
                    {stat.value}
                  </span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Sidebar Info */}
          <div className="space-y-8 lg:col-span-1">
            <motion.div variants={itemVariants}>
              <Card className="border-none bg-card shadow-lg ring-1 ring-border/50">
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Connect
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-primary">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">
                        {profile.email}
                      </span>
                    </div>
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-primary"
                      >
                        <Github className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">
                          GitHub Profile
                        </span>
                        <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-primary"
                      >
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">
                          LinkedIn
                        </span>
                        <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                      </a>
                    )}
                    {profile.twitter_url && (
                      <a
                        href={profile.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-primary"
                      >
                        <Twitter className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">
                          Twitter
                        </span>
                        <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                      </a>
                    )}
                    {profile.website_url && (
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-foreground/80 transition-colors hover:text-primary"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">
                          Website
                        </span>
                        <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-none bg-card shadow-lg ring-1 ring-border/50">
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Education
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span>
                          {profile.college || 'College not specified'}
                        </span>
                      </div>
                      {profile.graduation_year && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          Class of {profile.graduation_year}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {profile.address && (
              <motion.div variants={itemVariants}>
                <Card className="border-none bg-card shadow-lg ring-1 ring-border/50">
                  <CardContent className="pt-6">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      Location
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                      <MapPin className="text-red-500 h-4 w-4" />
                      <span>{profile.address}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="space-y-8 lg:col-span-2">
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-none bg-card shadow-lg ring-1 ring-border/50">
                <CardContent className="p-0">
                  <div className="p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                      <BookOpen className="h-5 w-5 text-primary" />
                      About
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {profile.bio ||
                        'No bio available. Adding a bio helps others know you better!'}
                    </p>
                  </div>

                  <Separator />

                  <div className="p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                      <Code2 className="text-blue-500 h-5 w-5" />
                      Skills & Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-primary/5 hover:bg-primary/10 border-primary/20 rounded-full border px-3 py-1 text-sm font-medium text-primary transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          No skills added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {profile.note && (
              <motion.div variants={itemVariants}>
                <Card className="from-primary/5 to-purple-500/5 ring-primary/20 overflow-hidden border-none bg-gradient-to-br shadow-lg ring-1">
                  <CardContent className="p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                      <Edit3 className="h-5 w-5 text-primary" />
                      Current Focus / Note
                    </h3>
                    <div className="border-primary/10 rounded-xl border bg-card/50 p-4 shadow-inner">
                      <p className="animate-pulse-slow text-base italic leading-relaxed text-muted-foreground">
                        "{profile.note}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

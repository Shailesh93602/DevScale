'use client';
import { useEffect, useState } from 'react';
import { useForm, Controller, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { firstTimeLoginSchema } from '../validations';
import { supabase } from '@/lib/supabaseClient';
import customAxios from '@/app/services/customAxios';
import { useRouter } from 'next/navigation';

const educationLevels = [
  'High School',
  "Bachelor's Degree",
  "Master's Degree",
  'Ph.D.',
  'Other',
];

const interests = [
  'Mathematics',
  'Science',
  'Literature',
  'History',
  'Computer Science',
  'Arts',
  'Languages',
];

const DetailsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(firstTimeLoginSchema),
  });

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      } else {
        try {
          const response = await customAxios.get('/user/profile');
          if (response.data.user) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkSession();
  }, [router]);

  const onSubmit = async (data: FieldValues) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const response = await customAxios.post('/user/create-profile', {
        userId: user.id,
        educationLevel: data.educationLevel,
        interests: data.interests,
        goals: data.goals,
      });

      if (response.data.success) {
        router.push('/dashboard');
      } else {
        throw new Error('Failed to create user profile');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Handle error (show toast, etc.)
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="from-primary/20 flex min-h-screen items-center justify-center bg-gradient-to-br to-secondary/20 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-background p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Complete Your Profile
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Controller
              name="educationLevel"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Education Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.educationLevel && (
              <p className="mt-1 text-sm text-destructive">
                {errors.educationLevel.message}
              </p>
            )}
          </div>
          <div>
            <p className="mb-2">Select Your Interests</p>
            {interests.map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Controller
                  name="interests"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={`interest-${interest}`}
                      checked={field.value?.includes(interest)}
                      onCheckedChange={(checked) => {
                        const updatedInterests = checked
                          ? [...(field.value || []), interest]
                          : (field.value || []).filter((i) => i !== interest);
                        field.onChange(updatedInterests);
                      }}
                    />
                  )}
                />
                <label htmlFor={`interest-${interest}`}>{interest}</label>
              </div>
            ))}
            {errors.interests && (
              <p className="mt-1 text-sm text-destructive">
                {errors.interests.message}
              </p>
            )}
          </div>
          <div>
            <Input
              {...register('goals')}
              placeholder="What are your learning goals?"
              className="w-full"
            />
            {errors.goals && (
              <p className="mt-1 text-sm text-destructive">
                {errors.goals.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Complete Profile
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DetailsPage;

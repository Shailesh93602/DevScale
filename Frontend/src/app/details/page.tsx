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
import { detailsFormSchema } from '../auth/validations';
import { supabase } from '@/lib/supabaseClient';
import customAxios from '@/app/services/customAxios';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const DetailsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [step, setStep] = useState(1);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(detailsFormSchema),
  });

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      }
      setLoading(false);
      setUser(session?.user);
    };

    checkSession();
  }, [router]);

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await customAxios.post('/user/create-profile', {
        userId: user?.id,
        email: user?.email,
        ...data,
      });

      if (response.data.success) {
        router.push('/dashboard');
      } else {
        throw new Error('Failed to create user profile');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
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
        {user?.email}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              <Input
                {...register('fullName')}
                placeholder="Full Name"
                className="w-full"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}

              <Input
                {...register('dob')}
                type="date"
                placeholder="Date of Birth"
                className="w-full"
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.dob.message}
                </p>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.gender.message}
                </p>
              )}

              <Input
                {...register('mobile')}
                placeholder="Mobile Number"
                className="w-full"
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.mobile.message}
                </p>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Input
                {...register('university')}
                placeholder="University Name"
                className="w-full"
              />
              {errors.university && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.university.message}
                </p>
              )}

              <Input
                {...register('college')}
                placeholder="College Name"
                className="w-full"
              />
              {errors.college && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.college.message}
                </p>
              )}

              <Input
                {...register('branch')}
                placeholder="Branch Name"
                className="w-full"
              />
              {errors.branch && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.branch.message}
                </p>
              )}

              <Input
                {...register('semester')}
                placeholder="Semester"
                className="w-full"
              />
              {errors.semester && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.semester.message}
                </p>
              )}
            </>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-1/3"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="w-1/3"
              >
                Next
              </Button>
            ) : (
              <Button type="submit" className="w-1/3">
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailsPage;

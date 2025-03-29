'use client';

import { useState, useEffect } from 'react';
import { Stepper } from './components/Stepper';
import { PersonalInfo } from './components/PersonalInfo';
import { ContactInfo } from './components/ContactInfo';
import { ProfessionalInfo } from './components/ProfessionalInfo';
import { EducationInfo } from './components/EducationInfo';
import { Button } from '@/components/ui/button';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAxiosGet, useAxiosPut } from '@/hooks/useAxios';
import { useRouter } from 'next/navigation';
import { IUser } from '@/types';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/features/user/userSlice';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { detailsSchema } from '@/lib/validations';
import { toast } from 'react-toastify';
import Loader from '@/components/Loader';

const steps = [
  'Personal Info',
  'Contact Info',
  'Professional Info',
  'Education Info',
];

// Add explicit type for form values
type FormValues = {
  full_name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  address: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  specialization: string;
  skills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  college: string;
  graduationYear: number;
};

// Update stepFields definition
const stepFields: (keyof FormValues)[][] = [
  ['full_name', 'username', 'bio', 'avatarUrl'],
  ['address', 'githubUrl', 'linkedinUrl', 'twitterUrl', 'websiteUrl'],
  ['specialization', 'skills', 'experienceLevel'],
  ['college', 'graduationYear'],
];

// Add isLastStep helper
const isLastStep = (step: number) => step === stepFields.length - 1;

export default function ProfilePage() {
  const [getUser, { data, isLoading: isGetUserLoading }] = useAxiosGet<{
    user: IUser;
  }>('/users/me');
  const router = useRouter();
  const dispatch = useDispatch();
  const supabase = createClient();
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [postUserDetails, { isLoading }] = useAxiosPut<{ user: IUser }>(
    '/users/me',
  );

  const methods = useForm<FormValues>({
    resolver: yupResolver(detailsSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: supabaseUser?.user_metadata?.full_name || '',
      username: '',
      bio: '',
      avatarUrl: '',
      address: '',
      githubUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
      websiteUrl: '',
      specialization: '',
      college: '',
      graduationYear: new Date().getFullYear(),
      skills: [] as string[],
      experienceLevel: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await postUserDetails(data);
      if (response?.data?.user) {
        dispatch(setUser({ user: response?.data?.user }));
      } else {
        console.log('Error updating user details');
        toast.error('Error updating user details');
        return;
      }
      await getCurrentUser();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex === currentStep) return;

    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    } else {
      let allValid = true;
      for (let i = currentStep; i < stepIndex; i++) {
        const valid = await methods.trigger(stepFields[i]);
        if (!valid) {
          allValid = false;
          break;
        }
      }
      if (allValid) setCurrentStep(stepIndex);
    }
  };

  const getCurrentUser = async () => {
    try {
      await getUser();
    } catch (error) {
      console.error(error);
    }
  };

  const getSupabaseUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (data) {
        setSupabaseUser(data.user);
      }
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCurrentUser();
    getSupabaseUser();
  }, []);

  useEffect(() => {
    if (data?.user) {
      dispatch(
        setUser({
          detailsComplete: true,
          user: data.user,
        }),
      );
      router.push('/dashboard');
    }
  }, [data, dispatch, router]);

  useEffect(() => {
    if (supabaseUser) {
      methods.reset({
        full_name: supabaseUser.user_metadata?.full_name || '',
        username: supabaseUser.user_metadata?.preferred_username || '',
        avatarUrl: supabaseUser.user_metadata?.avatar_url || '',
      });
    }
  }, [supabaseUser, methods]);

  const handleNext = async (data: FormValues) => {
    if (isLastStep(currentStep)) {
      await onSubmit(data);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  if (isGetUserLoading && !data?.user) {
    return <Loader type="SiteLoader" />;
  }

  return (
    <div className="container mx-auto w-full max-w-4xl rounded-lg bg-lightSecondary py-8 shadow-lg">
      <div className="flex justify-center pb-5">
        <span className="rounded-lg bg-lightSecondary px-2 py-1">
          {supabaseUser?.email}
        </span>
      </div>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleNext)}
          className="mt-8 space-y-8"
        >
          {currentStep === 0 && <PersonalInfo />}
          {currentStep === 1 && <ContactInfo />}
          {currentStep === 2 && <ProfessionalInfo />}
          {currentStep === 3 && <EducationInfo />}
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-white hover:bg-primary2"
            >
              Previous
            </Button>
            <Button
              type="submit"
              className="text-white hover:bg-primary2"
              disabled={isLoading}
            >
              {isLastStep(currentStep) ? 'Submit' : 'Next'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

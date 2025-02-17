'use client';

import { useState } from 'react';
import { Stepper } from './components/Stepper';
import { PersonalInfo } from './components/PersonalInfo';
import { ContactInfo } from './components/ContactInfo';
import { ProfessionalInfo } from './components/ProfessionalInfo';
import { EducationInfo } from './components/EducationInfo';
import { Button } from '@/components/ui/button';
import { useForm, FormProvider, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const steps = [
  'Personal Info',
  'Contact Info',
  'Professional Info',
  'Education Info',
];

const schema = yup.object().shape({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  username: yup.string().required('Username is required'),
  bio: yup.string(),
  avatarUrl: yup.string().url('Invalid URL'),
  address: yup.string(),
  githubUrl: yup.string().url('Invalid URL'),
  linkedinUrl: yup.string().url('Invalid URL'),
  twitterUrl: yup.string().url('Invalid URL'),
  websiteUrl: yup.string().url('Invalid URL'),
  specialization: yup.string(),
  college: yup.string(),
  graduationYear: yup.number().positive().integer(),
  skills: yup.array().of(yup.string()),
  experienceLevel: yup.string().required('Experience level is required'),
});

export default function ProfilePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const methods = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = (data: FieldValues) => {
    console.log(data);
    // Here you would typically send the data to your backend
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Stepper steps={steps} currentStep={currentStep} />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
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
            >
              Previous
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit">Submit</Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

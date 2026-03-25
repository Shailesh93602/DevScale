'use client';
import { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Control, FieldValues, useForm } from 'react-hook-form';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAxiosPost } from '@/hooks/useAxios';

const StepOne = ({ control }: { control: Control<FieldValues> }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 1: Basic Information</h2>
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="age"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Age</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Age" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="gender"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Gender</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const StepTwo = ({ control }: { control: Control<FieldValues> }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 2: Academic Information</h2>
    <FormField
      control={control}
      name="branch"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Branch</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Branch Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="year"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Year of Study</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="gpa"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Current GPA</FormLabel>
          <FormControl>
            <Input placeholder="Enter your GPA" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const StepThree = ({ control }: { control: Control<FieldValues> }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 3: Core Interests</h2>
    <FormField
      control={control}
      name="programmingExperience"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Programming Experience</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="favoriteTechDomain"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Favorite Tech Domain</FormLabel>
          <FormControl>
            <Input placeholder="Enter your favorite tech domain" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="coreInterest"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Are you interested in the core of your branch?</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const StepFour = ({ control }: { control: Control<FieldValues> }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 4: Additional Interests</h2>
    <FormField
      control={control}
      name="additionalInterests"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Any additional specific interests?</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter your additional interests"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="hobbies"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Hobbies</FormLabel>
          <FormControl>
            <Textarea placeholder="Enter your hobbies" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const StepFive = ({ control }: { control: Control<FieldValues> }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 5: Career Aspirations</h2>
    <FormField
      control={control}
      name="careerGoals"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What are your career goals as an engineer?</FormLabel>
          <FormControl>
            <Textarea placeholder="Enter your career goals" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="industryInterest"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Which industry sectors are you interested in?</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter industry sectors (e.g., technology, manufacturing)"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="environmentPreference"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Do you have a preference for working in a specific type of
            environment?
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="research">Research Institution</SelectItem>
              <SelectItem value="government">Government</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="skillsInterest"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Are there any particular skills or technologies you are passionate
            about or wish to specialize in?
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter your skills or technologies of interest"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const TechInterestAssessment = () => {
  const [step, setStep] = useState(1);
  const form = useForm();
  const [predict] = useAxiosPost('/predict');

  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const onSubmit = async (data: FieldValues) => {
    if (step < 5) {
      nextStep();
      return;
    }
    await predict(data);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepOne control={form.control} />;
      case 2:
        return <StepTwo control={form.control} />;
      case 3:
        return <StepThree control={form.control} />;
      case 4:
        return <StepFour control={form.control} />;
      case 5:
        return <StepFive control={form.control} />;
      default:
        return <h1>Invalid Step</h1>;
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-background py-12 text-foreground transition duration-300 ease-in-out">
      <div className="w-full max-w-lg rounded-lg bg-card p-10 shadow-lg dark:bg-gray-800 dark:text-white">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-4xl font-extrabold text-blue-700 dark:text-blue-800"
          >
            EduScale
          </Link>
        </div>
        <h1 className="mb-6 text-center text-3xl font-semibold dark:text-gray-100">
          Tech Interest Assessment
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}
            <div
              className={`mt-4 flex w-full ${
                step == 1 ? 'justify-end' : 'justify-between'
              }`}
            >
              {step > 1 && (
                <Button
                  type="submit"
                  className="mt-4 w-max bg-blue-600 py-3 text-white transition duration-200 ease-in-out hover:bg-blue-700"
                >
                  Previous
                </Button>
              )}
              <Button
                type="submit"
                className="mt-4 w-max bg-blue-600 py-3 text-white transition duration-200 ease-in-out hover:bg-blue-700"
              >
                {step < 5 ? 'Next' : 'Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default TechInterestAssessment;

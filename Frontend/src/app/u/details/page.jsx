"use client";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StepOne = ({ control }) => (
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
  </>
);

const StepTwo = ({ control }) => (
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
  </>
);

const StepThree = ({ control }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 3: Core Interests</h2>
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

const StepFour = ({ control }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 4: Additional Interests</h2>
    <FormField
      control={control}
      name="additionalInterests"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Any additional specific interests?</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Additional interests" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const StepFive = ({ control }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 5: Career Aspirations</h2>
    <FormField
      control={control}
      name="careerGoals"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What are your career goals as an engineer?</FormLabel>
          <FormControl>
            <Input placeholder="Enter your career goals" {...field} />
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
            <Input
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
            <Input placeholder="Enter skills or technologies" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const StepSix = ({ control }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 6: Education and Skills</h2>
    <FormField
      control={control}
      name="educationLevel"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            What level of education have you achieved or are currently pursuing?
          </FormLabel>
          <FormControl>
            <Input placeholder="Enter your education level" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="technicalSkills"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Are there any technical skills or certifications you have acquired
            or are planning to acquire that are relevant to your career goals?
          </FormLabel>
          <FormControl>
            <Input
              placeholder="Enter technical skills or certifications"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const StepSeven = ({ control }) => (
  <>
    <h2 className="text-2xl font-semibold">Step 7: Experience and Projects</h2>
    <FormField
      control={control}
      name="internships"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Have you completed any internships or work experiences related to
            your field of study?
          </FormLabel>
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
    <FormField
      control={control}
      name="projects"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Have you worked on any significant projects (academic or personal)
            that relate to your career interests?
          </FormLabel>
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

const Interests = () => {
  const [step, setStep] = useState(1);
  const form = useForm({
    mode: "onChange",
  });

  const onSubmit = (data) => {
    if (step < 7) {
      setStep(step + 1);
      return;
    } else console.log(data); // Here you would typically send data to your backend for processing
  };

  const renderFormStep = () => {
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
      case 6:
        return <StepSix control={form.control} />;
      case 7:
        return <StepSeven control={form.control} />;
      default:
        return null;
    }
  };

  return (
    <>
      <section className="min-h-screen flex items-center justify-center py-12 bg-background text-foreground transition duration-300 ease-in-out">
        <div className="w-full max-w-lg bg-card shadow-lg rounded-lg p-10 dark:bg-gray-800 dark:text-white">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-4xl font-extrabold text-blue-700 dark:text-blue-800"
            >
              Mr. Engineers
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-center mb-6 dark:text-gray-100">
            Career Roadmap Prediction
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderFormStep()}
              <div
                className={`flex w-full mt-4 ${
                  step === 1 ? "justify-end" : "justify-between"
                }`}
              >
                {step > 1 && (
                  <Button
                    type="button"
                    className="w-max py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
                    onClick={() => setStep(step - 1)}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  type="submit"
                  className="w-max py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
                >
                  {step < 7 ? "Next" : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </>
  );
};

export default Interests;

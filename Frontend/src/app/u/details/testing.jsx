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
import { Textarea } from "@/components/ui/textarea";

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
            <Textarea
              placeholder="Enter your additional interests"
              {...field}
            />
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
            <Textarea placeholder="Enter skills or technologies" {...field} />
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
            <Textarea
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

const StepEight = ({ control }) => (
  <>
    <h2 className="text-2xl font-semibold">
      Step 8: Personal Values and Lifestyle
    </h2>
    <FormField
      control={control}
      name="workLifeBalance"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What work-life balance are you looking for?</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describe your ideal work-life balance"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="jobStability"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            How important is job stability and security to you?
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="veryImportant">Very Important</SelectItem>
              <SelectItem value="somewhatImportant">
                Somewhat Important
              </SelectItem>
              <SelectItem value="notImportant">Not Important</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="relocation"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Are you open to relocating for a job? If so, which locations are you
            considering?
          </FormLabel>
          <FormControl>
            <Textarea placeholder="Enter preferred locations" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="incomeAspiration"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What level of income do you aspire to achieve?</FormLabel>
          <FormControl>
            <Input placeholder="Enter your income aspiration" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const StepNine = ({ control }) => (
  <>
    <h2 className="text-2xl font-semibold">
      Step 9: Soft Skills and Personal Traits
    </h2>
    <FormField
      control={control}
      name="communicationSkills"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            How would you describe your communication skills?
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describe your communication skills"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="stressHandling"
      render={({ field }) => (
        <FormItem>
          <FormLabel>How do you handle stress and pressure?</FormLabel>
          <FormControl>
            <Textarea placeholder="Describe how you handle stress" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="leadershipExperience"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What leadership experience do you have?</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describe your leadership experience"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="teamwork"
      render={({ field }) => (
        <FormItem>
          <FormLabel>How do you approach teamwork and collaboration?</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describe your teamwork and collaboration skills"
              {...field}
            />
          </FormControl>
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
    if (step < 9) {
      setStep(step + 1);
      return;
    } else {
      console.log("🚀 ~ file: testing.jsx:510 ~ onSubmit ~ data:", data);
    }
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
      case 8:
        return <StepEight control={form.control} />;
      case 9:
        return <StepNine control={form.control} />;
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
                  {step < 9 ? "Next" : "Submit"}
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

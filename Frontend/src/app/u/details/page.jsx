"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = yup.array().of(
  yup.object().shape({
    fullName: yup.string().required("Full Name is required."),
    dob: yup.date().required("Date of Birth is required."),
    gender: yup.string().required("Gender is required."),
  }),
  yup.object().shape({
    mobile: yup.string().required("Mobile Number is required."),
    whatsapp: yup.string(),
    address: yup.string().required("Address is required."),
  }),
  yup.object().shape({
    university: yup.string(),
    college: yup.string(),
    branch: yup.string(),
    semester: yup.number(),
  })
);

const Step1 = ({ control, errors }) => (
  <div>
    <FormField
      control={control}
      name="fullName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Full Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="dob"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Date of Birth</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="date"
              id="dob"
              className={`border ${
                errors?.dob ? "border-red-500" : "border-gray-300"
              } rounded-md px-3 py-2`}
            />
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
                <SelectValue placeholder="Select a verified email to display" />
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
  </div>
);

const Step2 = ({ control }) => (
  <div>
    <FormField
      control={control}
      name="mobile"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mobile Number</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Phone Number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="whatsapp"
      render={({ field }) => (
        <FormItem>
          <FormLabel>WhatsApp Number</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Whatsapp Number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Address</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Full Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

const Step3 = ({ control }) => (
  <div>
    <FormField
      control={control}
      name="university"
      render={({ field }) => (
        <FormItem>
          <FormLabel>University</FormLabel>
          <FormControl>
            <Input placeholder="Enter your University Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="college"
      render={({ field }) => (
        <FormItem>
          <FormLabel>College</FormLabel>
          <FormControl>
            <Input placeholder="Enter your College Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
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
      name="semester"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Semester</FormLabel>
          <FormControl>
            <Input placeholder="Enter your Semester" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

export default function Details() {
  const [step, setStep] = useState(1);
  const form = useForm({
    resolver: yupResolver(formSchema[step - 1]),
    mode: "onChange",
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    const response = await fetch("http://localhost:4000/profile/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const result = await response.json();
    if (result) {
      localStorage.setItem("user", JSON.stringify(result.user));
      toast.success("Registered Successfully!", { autoClose: 1500 });
      router.push("/dashboard");
    }
  };

  return (
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
          Fill additional details
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <Step1 control={form.control} errors={form.formState.errors} />
            )}
            {step === 2 && <Step2 control={form.control} />}
            {step === 3 && <Step3 control={form.control} />}

            <div className="flex justify-between mt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button
                  className="w-full py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
                  onClick={async () => {
                    const isValid = await form.trigger();
                    if (isValid) setStep(step + 1);
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
                >
                  Submit
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}

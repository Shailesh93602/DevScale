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
import CustomInput from "@/components/common/customInput";

const formSchema = [
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
    university: yup.string().required("University Name is required."),
    college: yup.string().required("College Name is required."),
    branch: yup.string().required("Branch Name is required"),
    semester: yup
      .number("Semester must be a number")
      .required("Semester Name is required"),
  }),
];

const Step1 = ({ control, errors }) => (
  <div>
    <CustomInput
      control={control}
      errors={errors}
      name="fullName"
      label="Full Name"
      placeholder="Enter you Full Name"
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
              <SelectTrigger
                className={`${errors?.gender && "border-red-600"}`}
              >
                <SelectValue placeholder="Select you gender" />
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

const Step2 = ({ control, errors }) => (
  <div>
    <CustomInput
      control={control}
      errors={errors}
      name="mobile"
      label="Mobile Number"
      placeholder="Enter you Phone Number"
    />

    <CustomInput
      control={control}
      errors={errors}
      name="whatsapp"
      label="WhatsApp Number"
      placeholder="Enter you Whatsapp Number"
    />

    <CustomInput
      control={control}
      errors={errors}
      name="address"
      label="Address"
      placeholder="Enter you Address"
    />
  </div>
);

const Step3 = ({ control, errors }) => (
  <div>
    <CustomInput
      control={control}
      errors={errors}
      name="university"
      label="University"
      placeholder="Enter you University Name"
    />
    <CustomInput
      control={control}
      errors={errors}
      name="college"
      label="College"
      placeholder="Enter your College Name"
    />
    <FormField
      control={control}
      name="branch"
      label="Branch"
      placeholder="Enter your Branch Name"
    />
    <CustomInput
      control={control}
      errors={errors}
      name="semester"
      label="Semester"
      placeholder="Enter your Semester"
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
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const response = await fetch("http://localhost:4000/profile/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const result = await response.json();
    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result.user));
      toast.success("Registered Successfully!", { autoClose: 1500 });
      router.push("/dashboard");
    } else {
      toast.error(result.message, { autoClose: 1500 });
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
            {step === 2 && (
              <Step2 control={form.control} errors={form.errors} />
            )}
            {step === 3 && (
              <Step3 control={form.control} errors={form.errors} />
            )}

            <div
              className={`flex w-full mt-4 ${
                step == 1 ? "justify-end" : "justify-between"
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
                {step < 3 ? "Next" : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useState } from "react";

const Step1 = ({ control, errors }) => (
  <div>
    <div>
      <Label htmlFor="fullName">Full Name</Label>
      <Controller
        name="fullName"
        control={control}
        defaultValue=""
        rules={{ required: "Full Name is required." }}
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            placeholder="John Doe"
            id="fullName"
            className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${
              errors.fullName ? "border-red-500" : "focus:border-blue-500"
            }`}
          />
        )}
      />
      {errors.fullName && (
        <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
      )}
    </div>
    <div>
      <Label htmlFor="dob">Date of Birth</Label>
      <Controller
        name="dob"
        control={control}
        defaultValue=""
        rules={{ required: "Date of Birth is required." }}
        render={({ field }) => (
          <Input
            {...field}
            type="date"
            id="dob"
            className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${
              errors.dob ? "border-red-500" : "focus:border-blue-500"
            }`}
          />
        )}
      />
      {errors.dob && (
        <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
      )}
    </div>
    <div>
      <Label htmlFor="gender">Gender</Label>
      <Controller
        name="gender"
        control={control}
        defaultValue=""
        rules={{ required: "Gender is required." }}
        render={({ field }) => (
          <select
            {...field}
            id="gender"
            className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${
              errors.gender ? "border-red-500" : "focus:border-blue-500"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        )}
      />
      {errors.gender && (
        <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
      )}
    </div>
  </div>
);

const Step2 = ({ control, errors }) => (
  <div>
    <div>
      <Label htmlFor="mobile">Mobile Number</Label>
      <Controller
        name="mobile"
        control={control}
        defaultValue=""
        rules={{ required: "Mobile Number is required." }}
        render={({ field }) => (
          <Input
            {...field}
            type="tel"
            placeholder="1234567890"
            id="mobile"
            className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${
              errors.mobile ? "border-red-500" : "focus:border-blue-500"
            }`}
          />
        )}
      />
      {errors.mobile && (
        <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
      )}
    </div>
    <div>
      <Label htmlFor="whatsapp">Whatsapp Number</Label>
      <Controller
        name="whatsapp"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            {...field}
            type="tel"
            placeholder="1234567890"
            id="whatsapp"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        )}
      />
    </div>
    <div>
      <Label htmlFor="address">Address</Label>
      <Controller
        name="address"
        control={control}
        defaultValue=""
        rules={{ required: "Address is required." }}
        render={({ field }) => (
          <textarea
            {...field}
            id="address"
            placeholder="123 Street, City, Country"
            className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${
              errors.address ? "border-red-500" : "focus:border-blue-500"
            }`}
          ></textarea>
        )}
      />
      {errors.address && (
        <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
      )}
    </div>
  </div>
);

const Step3 = ({ control, errors }) => (
  <div>
    <div>
      <Label htmlFor="university">University</Label>
      <Controller
        name="university"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            placeholder="Your University"
            id="university"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        )}
      />
    </div>
    <div>
      <Label htmlFor="college">College</Label>
      <Controller
        name="college"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            placeholder="Your College"
            id="college"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        )}
      />
    </div>
    <div>
      <Label htmlFor="branch">Branch</Label>
      <Controller
        name="branch"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            placeholder="Your Branch"
            id="branch"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        )}
      />
    </div>
    <div>
      <Label htmlFor="semester">Semester</Label>
      <Controller
        name="semester"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            placeholder="Your Semester"
            id="semester"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        )}
      />
    </div>
  </div>
);

export default function Details() {
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onTouched" });
  const [step, setStep] = useState(1);
  const router = useRouter();

  const onSubmit = async (data) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      let result = await fetch("http://localhost:4000/profile/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      let json = await result.json();
      if (json.success) {
        toast.success("Registered Successfully!");
        router.push("/");
      } else {
        toast.error(json.message);
      }
    }
  };

  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mr. Engineers
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Register
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && <Step1 control={control} errors={errors} />}
          {step === 2 && <Step2 control={control} errors={errors} />}
          {step === 3 && <Step3 control={control} errors={errors} />}
          <div className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                className="bg-gray-600 text-white"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
            )}
            <Button type="submit" className="bg-blue-600 text-white">
              {step < 3 ? "Next" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

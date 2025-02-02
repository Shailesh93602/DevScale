'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Control, FieldErrors, FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form } from '@/components/ui/form';
import { useState } from 'react';
import CustomInput, { CustomSelect } from '@/components/common/customInput';
import { fetchData } from '@/app/services/fetchData';

const formSchema = [
  yup.object().shape({
    fullName: yup.string().required('Full Name is required.'),
    dob: yup.date().required('Date of Birth is required.'),
    gender: yup.string().required('Gender is required.'),
  }),
  yup.object().shape({
    mobile: yup.string().required('Mobile Number is required.'),
    whatsapp: yup.string(),
    address: yup.string().required('Address is required.'),
  }),
  yup.object().shape({
    university: yup.string().required('University Name is required.'),
    college: yup.string().required('College Name is required.'),
    branch: yup.string().required('Branch Name is required'),
    semester: yup
      .number()
      .required('Semester Name is required')
      .typeError('Semester must be a number'),
  }),
];

const Step1 = ({
  control,
  errors,
}: {
  control: Control<
    {
      [x: string]: string;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  errors: FieldErrors;
}) => (
  <div>
    <CustomInput
      control={control}
      errors={errors}
      name="fullName"
      label="Full Name"
      placeholder="Enter your Full Name"
    />
    <CustomInput
      control={control}
      errors={errors}
      name="dob"
      type="date"
      label="Date of Birth"
      placeholder="Enter your Date of Birth"
    />
    <CustomSelect
      control={control}
      errors={errors}
      name="gender"
      label="Gender"
      placeholder="Select your gender"
      options={[
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ]}
    />
  </div>
);

const Step2 = ({
  control,
  errors,
}: {
  control: Control<
    {
      [x: string]: string;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  errors: FieldErrors;
}) => (
  <div>
    <CustomInput
      control={control}
      errors={errors}
      name="mobile"
      label="Mobile Number"
      placeholder="Enter your Phone Number"
    />
    <CustomInput
      control={control}
      errors={errors}
      name="whatsapp"
      label="WhatsApp Number"
      placeholder="Enter your Whatsapp Number"
    />

    <CustomInput
      control={control}
      errors={errors}
      name="address"
      label="Address"
      placeholder="Enter your Address"
    />
  </div>
);

const Step3 = ({
  control,
  errors,
}: {
  control: Control<
    {
      [x: string]: string;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  errors: FieldErrors;
}) => (
  <div>
    <CustomInput
      control={control}
      errors={errors}
      name="university"
      label="University"
      placeholder="Enter your University Name"
    />
    <CustomInput
      control={control}
      errors={errors}
      name="college"
      label="College"
      placeholder="Enter your College Name"
    />
    <CustomInput
      control={control}
      name="branch"
      label="Branch"
      placeholder="Enter your Branch Name"
      errors={errors}
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(formSchema[step - 1] as any),
    mode: 'onChange',
  });

  const router = useRouter();

  const onSubmit = async (data: FieldValues) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const response = await fetchData(
      'POST',
      '/profile/register',
      JSON.stringify(data),
    );
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Registered Successfully!', { autoClose: 1500 });
      router.push('/dashboard');
    } else {
      toast.error(response.data.message, { autoClose: 1500 });
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
            Mr. Engineers
          </Link>
        </div>
        <h1 className="mb-6 text-center text-3xl font-semibold dark:text-gray-100">
          Fill additional details
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <Step1 control={form.control} errors={form.formState.errors} />
            )}
            {step === 2 && (
              <Step2 control={form.control} errors={form.formState.errors} />
            )}
            {step === 3 && (
              <Step3 control={form.control} errors={form.formState.errors} />
            )}

            <div
              className={`mt-4 flex w-full ${
                step == 1 ? 'justify-end' : 'justify-between'
              }`}
            >
              {step > 1 && (
                <Button
                  type="button"
                  className="mt-4 w-max bg-blue-600 py-3 text-white transition duration-200 ease-in-out hover:bg-blue-700"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
              <Button
                type="submit"
                className="mt-4 w-max bg-blue-600 py-3 text-white transition duration-200 ease-in-out hover:bg-blue-700"
              >
                {step < 3 ? 'Next' : 'Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}

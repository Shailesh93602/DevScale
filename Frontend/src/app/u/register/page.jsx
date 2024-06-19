"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Toast, { showToast } from "../../../components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(2, "Username must be at least 2 characters."),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .trim()
    .required("Confirm Password is required")
    .oneOf([yup.ref("password"), null], "Passwords do not match"),
});

export default function Register() {
  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: "onTouched",
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const json = await response.json();
      if (json.success) {
        showToast("Registered Successfully!", "success");
        setTimeout(() => {
          router.push("/u/login");
        }, 2000);
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again later.");
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center py-12">
      <Toast />
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            Mr. Engineers
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Register
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Confirm Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Register
            </Button>
            <div className="text-sm text-gray-500 mt-4 text-center">
              <p>
                Already have an account?{" "}
                <Link href="/u/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}

{
  /* <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
  <div className="flex flex-col gap-4">
    <div className="grid gap-1.5">
      <Label htmlFor="username">Username</Label>
      <Controller
        name="username"
        control={control}
        defaultValue=""
        rules={{ required: "Username is required." }}
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            placeholder="Enter your username"
            id="username"
            className={`border border-gray-300 rounded-md px-3 py-2 ${
              errors.username
                ? "border-red-500 focus-visible:outline-red-500"
                : "border-blue-500 focus-visible:outline-blue-500"
            }`}
          />
        )}
      />
      {errors.username && (
        <p className="text-red-500 text-sm">{errors.username.message}</p>
      )}
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Controller
        name="email"
        control={control}
        defaultValue=""
        rules={{
          required: "Email is required.",
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Please enter a valid email address.",
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            type="text"
            placeholder="Enter your email"
            id="email"
            className={`border border-gray-300 rounded-md px-3 py-2 ${
              errors.email
                ? "border-red-500 focus-visible:outline-red-500"
                : "border-blue-500 focus-visible:outline-blue-500"
            }`}
          />
        )}
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor="password">Password</Label>
      <Controller
        name="password"
        control={control}
        defaultValue=""
        rules={{ required: "Password is required." }}
        render={({ field }) => (
          <Input
            {...field}
            type="password"
            placeholder="Enter your password"
            id="password"
            className={`border border-gray-300 rounded-md px-3 py-2 ${
              errors.password
                ? "border-red-500 focus-visible:outline-red-500"
                : "border-blue-500 focus-visible:outline-blue-500"
            }`}
          />
        )}
      />
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password.message}</p>
      )}
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor="confirmPassword">Confirm Password</Label>
      <Controller
        name="confirmPassword"
        control={control}
        defaultValue=""
        rules={{
          required: "Confirm Password is required.",
          validate: (value) =>
            value === getValues("password") || "Passwords do not match.",
        }}
        render={({ field }) => (
          <Input
            {...field}
            type="password"
            placeholder="Repeat your password"
            id="confirmPassword"
            className={`border border-gray-300 rounded-md px-3 py-2 ${
              errors.confirmPassword
                ? "border-red-500 focus-visible:outline-red-500"
                : "border-blue-500 focus-visible:outline-blue-500"
            }`}
          />
        )}
      />
      {errors.confirmPassword && (
        <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
      )}
    </div>
    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
      Register
    </Button>
  </div>
  <div className="text-sm text-gray-500 mt-4 text-center">
    <p>
      Already have an account?{" "}
      <Link href="/u/login" className="text-blue-600 hover:underline">
        Login here
      </Link>
    </p>
  </div>
</form>; */
}

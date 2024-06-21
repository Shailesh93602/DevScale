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
    <section className="min-h-screen flex items-center justify-center py-12 bg-background text-foreground transition duration-300 ease-in-out">
      <Toast />
      <div className="w-full max-w-lg bg-card shadow-lg rounded-lg p-10 dark:bg-gray-800">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-4xl font-extrabold text-custom-color-light dark:text-custom-color-dark"
          >
            Mr. Engineers
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-center mb-6 dark:text-gray-100">
          Create Your Account
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be your public display name.
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
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
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
                    <Input
                      type="password"
                      placeholder="Create a password"
                      {...field}
                    />
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
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full py-3 mt-4 bg-custom-color-light text-white hover:bg-custom-color-dark transition duration-200 ease-in-out transform hover:scale-105 dark:bg-custom-color-dark dark:hover:bg-custom-color-light dark:text-gray-900">
              Register
            </Button>
            <div className="text-center mt-4 text-sm text-muted-foreground dark:text-gray-400">
              <p>
                Already have an account?{" "}
                <Link
                  href="/u/login"
                  className="text-custom-color-light hover:underline dark:text-custom-color-dark"
                >
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

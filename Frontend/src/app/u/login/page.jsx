"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form } from "@/components/ui/form";
import CustomInput from "@/components/common/customInput";
import { apiResponse } from "@/api/api";
import { useDispatch } from "react-redux";
import { initialUser } from "@/lib/features/user/userSlice";
import { Lock, User } from "lucide-react";

const formSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(2, "Username must be at least 2 characters."),
  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const dispatch = useDispatch();
  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const router = useRouter();
  const onSubmit = async (data) => {
    try {
      const response = await apiResponse({
        method: "POST",
        endpoint: "/auth/login",
        data,
      });

      if (response.data?.success) {
        dispatch(initialUser(response.data.user));
        toast.success("Logged In Successfully!");

        document.cookie = `token=${response.data.token};expires=${new Date(
          Date.now() + 100 * 60 * 60 * 1000
        ).toUTCString()};path=/;`;
        router.push("/dashboard");
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      toast.error("LogIn failed. Please try again later.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-300 ease-in-out">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl transition-all duration-300 ease-in-out">
        <div className="text-center">
          <Link href="/" className="flex justify-center items-center mb-6">
            <span className="sr-only">Mr. Engineers</span>
            <img
              className="h-12 w-auto"
              src="/api/placeholder/200/200"
              alt="Mr. Engineers Logo"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Log in to your account
          </h2>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-6"
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <CustomInput
                  control={form.control}
                  errors={form.formState.errors}
                  name="username"
                  label="Username"
                  placeholder="Enter your Username"
                  icon={<User className="h-5 w-5 text-gray-400" />}
                />
              </div>
              <div>
                <CustomInput
                  control={form.control}
                  errors={form.formState.errors}
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your Password"
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/u/forgotPassword"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Sign in
              </Button>
            </div>
          </form>
        </Form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div>
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <img
                  className="h-5 w-5"
                  src="/api/placeholder/20/20"
                  alt="Google"
                />
              </a>
            </div>
            <div>
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <img
                  className="h-5 w-5"
                  src="/api/placeholder/20/20"
                  alt="Facebook"
                />
              </a>
            </div>
            <div>
              <a
                href="#"
                className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <img
                  className="h-5 w-5"
                  src="/api/placeholder/20/20"
                  alt="GitHub"
                />
              </a>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Not a member?{" "}
          <Link
            href="/u/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign up now
          </Link>
        </p>
      </div>
    </section>
  );
}

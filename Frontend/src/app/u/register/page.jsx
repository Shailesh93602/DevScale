"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { apiResponse } from "@/api/api";
import { useDispatch } from "react-redux";
import { initialUser } from "@/lib/features/user/userSlice";
import { Moon, Sun, Loader } from "lucide-react";
import loginimg from "@/assets/login4.avif";
import Image from "next/image";

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
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export default function ModernLogin() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await apiResponse({
        method: "POST",
        endpoint: "/auth/register",
        data,
      });

      if (response.data?.success) {
        dispatch(initialUser(response.data.user));
        toast.success("Sign Up Successfully!");

        document.cookie = `token=${response.data.token};expires=${new Date(
          Date.now() + 100 * 60 * 60 * 1000
        ).toUTCString()};path=/;`;
        router.push("/dashboard");
      } else {
        toast.error(
          response.data?.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex min-h-screen bg-gray-100 text-gray-900`}>
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Sign Up</h2>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/u/login" className="text-purple-600 hover:underline">
              Sign in
            </Link>
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
              >
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                placeholder="john doe"
                className="w-full px-3 py-2 border rounded-md bg-white border-gray-300"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                id="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 border rounded-md bg-white border-gray-300"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                id="password"
                placeholder="Enter 8 characters or more"
                className="w-full px-3 py-2 border rounded-md bg-white border-gray-300"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Confirm Password
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                className="w-full px-3 py-2 border rounded-md bg-white border-gray-300"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Link
              href="/u/forgotPassword"
              className="text-sm text-purple-600 hover:underline"
            >
              Forgot Password?
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                  Signing up...
                </>
              ) : (
                "SIGN UP"
              )}
            </button>
          </form>
          <div className="mt-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              or sign up with
            </p>
            <div className="flex space-x-4">
              <button className="flex-1 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:text-white transition duration-300">
                Google
              </button>
              <button className="flex-1 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:text-white transition duration-300">
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center bg-purple-100">
        <Image
          src={loginimg}
          alt="Login illustration"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

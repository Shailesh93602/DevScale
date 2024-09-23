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
  // email: yup.string().required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
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
        toast.error(
          response.data?.message || "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`flex min-h-screen 
   bg-gray-100 text-gray-900
      `}
    >
      <div className="flex-1 flex items-center justify-center p-10">
        <div
          className={`w-full max-w-md 
           "bg-white
           rounded-lg shadow-xl p-8`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Login</h2>
            {/* <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button> */}
          </div>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Don't have an account yet?{" "}
            <Link
              href="/u/register"
              className="text-purple-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                // type="email"
                id="email"
                placeholder="you@example.com"
                className={`w-full px-3 py-2 border rounded-md bg-white border-gray-300`}
              />
              {/* {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )} */}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link
                  href="/u/forgotPassword"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                id="password"
                placeholder="Enter 6 character or more"
                className={`w-full px-3 py-2 border rounded-md bg-white border-gray-300`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-sm">
                Remember me
              </label>
            </div> */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-3" />
                  Signing in...
                </>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>
          <div className="mt-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              or login with
            </p>
            <div className="flex space-x-4">
              <button className="flex-1 py-2 border rounded-md dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300">
                Google
              </button>
              <button className="flex-1 py-2 border rounded-md dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300">
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center  justify-center bg-purple-100">
        <Image
          src={loginimg}
          alt="Login illustration"
          className=" w-full h-full"
        />
      </div>
    </div>
  );
}

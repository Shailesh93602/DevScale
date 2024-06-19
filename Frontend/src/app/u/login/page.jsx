"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Toast, { showToast } from "../../../components/Toast";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const router = useRouter();

  const onSubmit = async (data) => {
    console.log(data);

    let result = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    let json = await result.json();
    if (json.success) {
      showToast("Logged In Successfully!", "success");
      console.log(json);
      setTimeout(() => {
        router.push(json.route);
      }, 2000);
    } else {
      toast.error(json.message);
    }
  };

  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <Toast />
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mr. Engineers
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Login
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="username">Username or Email</Label>
              <Controller
                name="username"
                control={control}
                defaultValue=""
                rules={{ required: "Username or Email is required." }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter your username or Email"
                    id="username"
                    className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${errors.username ? "border-red-500" : "focus:border-blue-500"
                      }`}
                  />
                )}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
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
                    className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${errors.password ? "border-red-500" : "focus:border-blue-500"
                      }`}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition duration-300 ease-in-out">
              Login
            </Button>
          </div>
          <div className="text-sm text-gray-500 mt-4">
            <p>
              Don't have an account?{" "}
              <Link href="/u/register" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
            <p>
              Forgot password?{" "}
              <Link
                href="/u/forgotPassword"
                className="text-blue-600 hover:underline"
              >
                Click here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>

  );
}

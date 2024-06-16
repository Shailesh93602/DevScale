"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Toast, { showToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });
  const router = useRouter();

  const onSubmit = async (data) => {
    let result = await fetch("http://localhost:4000/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    let json = await result.json();
    if (json.success) {
      showToast("Password reset email sent!", "success");
      setTimeout(() => {
        router.push("/u/login");
      }, 2000);
    } else {
      toast.error(json.message);
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center">
      <Toast />
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mr. Engineers
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Forgot Password
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Send Reset Link
          </Button>
          <div className="text-sm text-gray-500">
            <p>
              Remember your password?{" "}
              <Link href="/u/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
            <p>
              Don't have an account?{" "}
              <Link
                href="/u/register"
                className="text-blue-600 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (data) => {
    console.log(data);
    let result = await fetch("http://localhost:4000/auth/resetPassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    console.log(result);
    let json = await result.json();
    if (json.success) console.log(json);
  };

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mr. Engineers
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Reset Password
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Submit
          </Button>
        </form>
      </div>
    </section>
  );
}

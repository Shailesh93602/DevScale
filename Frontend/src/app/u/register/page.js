"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Toast, { showToast } from "../../../components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";

export default function Register() {
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

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
          router.push("/login");
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
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                    className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.username
                        ? "border-red-500 focus:ring-red-500"
                        : "border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                )}
              />
              {errors.username && (
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
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
                    className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-blue-500 focus:ring-blue-500"
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
                    className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
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
                    value === getValues("password") ||
                    "Passwords do not match.",
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    placeholder="Repeat your password"
                    id="confirmPassword"
                    className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-blue-500 focus:ring-blue-500"
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
        </form>
      </div>
    </section>
  );
}

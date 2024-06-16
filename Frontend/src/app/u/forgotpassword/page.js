"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Toast, { showToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return document.getElementById("email").focus();

    let result = await fetch("http://localhost:4000/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
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
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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

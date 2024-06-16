"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import Toast, { showToast } from "../../../components/Toast";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return document.getElementById("username").focus();
    if (!password) return document.getElementById("password").focus();

    let result = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
      credentials: "include",
    });
    let json = await result.json();
    if (json.success) {
      showToast("Logged In Successfully!", "success");
      setTimeout(() => {
        router.push(json.route);
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
          Login
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username or Email
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="john1998"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Login
          </Button>
          <div className="text-sm text-gray-500">
            <p>
              Don't have an account?{" "}
              <Link
                href="/u/register"
                className="text-blue-600 hover:underline"
              >
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

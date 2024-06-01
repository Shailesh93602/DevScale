"use client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { useState } from "react";

export default function resetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useSearchParams();
  const token = router.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return document.getElementById("password").focus();
    if (!confirmPassword)
      return document.getElementById("confirmPassword").focus();

    if (password !== confirmPassword) {
      return console.log("passwod and confirmpassword must be same");
    } else {
      let result = await fetch("http://localhost:4000/auth/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          password: password,
        }),
        credentials: "include",
      });
      console.log(result);
      let json = await result.json();
      if (json.success) console.log(json);
    }
  };
  return (
    <section className="bg-gray-50 ">
      <div className="flex mb-60 flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <Link
          href="/"
          className="flex items-center mb-4 text-2xl font-semibold text-gray-900"
        >
          Mr. Engineers
        </Link>
        <div className="w-full  bg-light rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6  space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl flex justify-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Reset Password
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  {" "}
                  New password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="*********"
                  required=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  {" "}
                  Confirm password
                </label>
                <input
                  type="password"
                  name="confirmpassword"
                  id="confirmpassword"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="*********"
                  required=""
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              >
                submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

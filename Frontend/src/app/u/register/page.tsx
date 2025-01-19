"use client";
import React, { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { initialUser } from "@/lib/features/user/userSlice";
import Image from "next/image";
import { registerSchema } from "../validations";
import RegisterForm from "../components/RegistrationForm";
import { useMediaQuery } from "@/hooks/use-media-query";
import customAxios from "@/app/services/customAxios";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const isSmallScreen = useMediaQuery("(max-width:960px)");

  const form = useForm({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: FieldValues) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await customAxios.post("/auth/register", data);

      if (response.data?.success) {
        dispatch(initialUser(response.data.user));
        toast.success("Registered Successfully!");

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

  return (
    <div className="flex flex-col lg:flex-row bg-lightSecondary m-10 mx-20 rounded-lg">
      <div className="hidden lg:flex flex-col justify-center items-center relative p-8 flex-1">
        <h4 className="absolute top-5 left-5 text-2xl font-bold text-foreground">
          Mr.Engineer
        </h4>
        {!isSmallScreen && (
          <Image
            src="/images/boy-with-rocket-dark.png"
            alt="Illustration"
            width={600}
            height={600}
          />
        )}
      </div>
      <div className="flex flex-col justify-center p-8 flex-1 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-2xl font-bold text-foreground">
              Adventure starts here 🚀
            </h4>
          </div>
          <p className="text-muted-foreground mb-6">
            Make your app management easy and fun!
          </p>
          <RegisterForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/u/login" className="text-primary hover:underline">
              Sign in instead
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

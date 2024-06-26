"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form } from "@/components/ui/form";
import CustomInput from "@/components/common/customInput";

const formSchema = yup.object({
  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup.string().trim().required("Confirm Password is required"),
});

export default function Login() {
  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(
        "https://mrengineersapi.vercel.app/auth/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "include",
        }
      );
      const json = await response.json();
      if (json.success) {
        toast.success("Password changed Successfully!");
        setTimeout(() => {
          router.push("/u/login");
        }, 1000);
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 bg-background text-foreground transition duration-300 ease-in-out">
      <div className="w-full max-w-lg bg-card shadow-lg rounded-lg p-10 dark:bg-gray-800 dark:text-white">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-4xl font-extrabold text-blue-700 dark:text-blue-800"
          >
            Mr. Engineers
          </Link>
        </div>
        <h1 className="text-3xl font-semibold text-center mb-6 dark:text-gray-100">
          Reset Password
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomInput
              control={form.control}
              errors={form.formState.errors}
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your Password"
            />
            <CustomInput
              control={form.control}
              errors={form.formState.errors}
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Enter your Password again"
            />
            <Button
              type="submit"
              className="w-full py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
            >
              Login
            </Button>
            <div className="text-center mt-4 text-sm text-muted-foreground dark:text-gray-400">
              <p>
                Know your password?{" "}
                <Link
                  href="/u/register"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}

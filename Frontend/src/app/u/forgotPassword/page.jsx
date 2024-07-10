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
import { fetchData } from "@/utils/fetchData";

const formSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(2, "Username must be at least 2 characters."),
});

export default function ForgotPassword() {
  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await fetchData(
        "POST",
        "/auth/forgot",
        JSON.stringify(data)
      );
      const data = response.data;
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          router.push("/u/login");
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
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
          Forgot Password
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomInput
              control={form.control}
              errors={form.formState.errors}
              name="username"
              label="Username"
              placeholder="Enter your Username"
            />
            <Button
              type="submit"
              className="w-full py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
            >
              Submit
            </Button>
            <div className="text-center mt-4 text-sm text-muted-foreground dark:text-gray-400">
              <p>
                Don't have an account?{" "}
                <Link
                  href="/u/register"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}

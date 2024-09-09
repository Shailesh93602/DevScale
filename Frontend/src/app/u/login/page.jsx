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
import { apiResponse } from "@/api/api";
import { useDispatch } from "react-redux";
import { initialUser } from "@/lib/features/user/userSlice";

const formSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(2, "Username must be at least 2 characters."),
  password: yup
    .string()
    .trim()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const dispatch = useDispatch();
  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const router = useRouter();
  const onSubmit = async (data) => {
    try {
      const response = await apiResponse({
        method: "POST",
        endpoint: "/auth/login",
        data,
      });

      if (response.data?.success) {
        dispatch(initialUser(response.data.user));
        toast.success("Logged In Successfully!");

        document.cookie = `token=${response.data.token};expires=${new Date(
          Date.now() + 100 * 60 * 60 * 1000
        ).toUTCString()};path=/;`;
        router.push("/dashboard");
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      toast.error("LogIn failed. Please try again later.");
    }
  };

  return (
    <section className="min-h-screen flex items-centerdark:bg-black justify-center py-12 bg-background text-foreground transition duration-300 ease-in-out">
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
          LogIn to Your Account
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
            <CustomInput
              control={form.control}
              errors={form.formState.errors}
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your Password"
            />
            <div className="text-end mt-4 text-sm text-muted-foreground dark:text-gray-400">
              <Link
                href="/u/forgotPassword"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Forgot Password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
            >
              Login
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

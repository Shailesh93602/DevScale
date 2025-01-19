import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldValues, UseFormReturn } from "react-hook-form";

export default function RegisterForm({
  form,
  onSubmit,
  isLoading,
}: {
  form: UseFormReturn<{
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>;
  onSubmit: (e: FieldValues) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...register("username")}
          placeholder="Enter your Username"
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register("email")}
          placeholder="Enter your Email Address"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          placeholder="Enter your password again"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember Me
          </label>
        </div>
        <a
          href="/u/forgotPassword"
          className="text-sm text-primary hover:underline"
        >
          Forgot Password?
        </a>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign up"}
      </Button>
    </form>
  );
}

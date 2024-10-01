"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  TextField,
  Typography,
  Link,
  useMediaQuery,
} from "@mui/material";
import { Facebook, Twitter, GitHub, Google } from "@mui/icons-material";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { apiResponse } from "@/api/api";
import { useDispatch } from "react-redux";
import { initialUser } from "@/lib/features/user/userSlice";

// Define validation schema with Yup
const formSchema = yup.object({
  username: yup.string().required("Email or Username is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  // API call and submit handler
  const onSubmit = async (data) => {
    if (isLoading) return;
    setIsLoading(true);
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
        toast.error(
          response.data?.message || "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Static breakpoint for small screens
  const isSmallScreen = useMediaQuery("(max-width:960px)");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        height: "100vh",
        bgcolor: "#1e1e2f",
      }}
    >
      {/* Left side - Illustration */}
      <Box
        sx={{
          flex: isSmallScreen ? "none" : 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          p: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{ position: "absolute", top: 20, left: 20, color: "white" }}
        >
          Mr.Engineer
        </Typography>

        {!isSmallScreen && (
          <Image
            src="/images/boy-with-rocket-dark.png"
            alt="Illustration"
            width="1000"
            height="1000"
          />
        )}
      </Box>

      {/* Right side - Login Form */}
      <Box
        sx={{
          flex: isSmallScreen ? "none" : 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: 4,
          bgcolor: "#2f3349",
          overflowY: "auto",
          marginY: isSmallScreen ? "auto" : "none",
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, color: "white" }}>
          Welcome to Mr.Engineer! 👋
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: "gray" }}>
          Please sign-in to your account and start the adventure
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register("username")}
            label="Email or Username"
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: "white" } }}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            {...register("password")}
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: "white" } }}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox sx={{ color: "gray" }} />
              <Typography variant="body2" sx={{ color: "gray" }}>
                Remember Me
              </Typography>
            </Box>
            <Link
              href="/u/forgotPassword"
              variant="body2"
              sx={{ color: "#696cff" }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mb: 2, bgcolor: "#696cff" }}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 2, color: "gray" }}
        >
          New on our platform?{" "}
          <Link href="/u/register" sx={{ color: "#696cff" }}>
            Create an account
          </Link>
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 2, color: "gray" }}
        >
          or
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Facebook sx={{ color: "#497ce2" }} />
          <Twitter sx={{ color: "#1da1f2" }} />
          <GitHub sx={{ color: "white" }} />
          <Google sx={{ color: "#db4437" }} />
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;

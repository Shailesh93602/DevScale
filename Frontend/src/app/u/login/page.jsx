"use client";
import React, { useState, createContext, useContext, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  TextField,
  Typography,
  Link,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  IconButton,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  GitHub,
  Google,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { apiResponse } from "@/api/api";
import { useDispatch } from "react-redux";
import { initialUser } from "@/lib/features/user/userSlice";

// Create a context for the color mode
const ColorModeContext = createContext({ toggleColorMode: () => {} });

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
  const [mode, setMode] = useState("dark");
  const router = useRouter();
  const dispatch = useDispatch();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#696CFF" },
                background: { default: "#f5f5f5", paper: "#ffffff" },
                text: { primary: "#333333", secondary: "#666666" },
              }
            : {
                primary: { main: "#696CFF" },
                background: { default: "#1E1E2F", paper: "#2F3349" },
                text: { primary: "#ffffff", secondary: "#cccccc" },
              }),
        },
      }),
    [mode]
  );

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
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            height: "100vh",
            bgcolor: "background.default",
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
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                color: "text.primary",
              }}
            >
              Mr.Engineer
            </Typography>
            {!isSmallScreen && (
              <Image
                src={
                  mode === "light"
                    ? "/images/boy-with-rocket-dark.png"
                    : "/images/boy-with-rocket-dark.png"
                }
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
              bgcolor: "background.paper",
              overflowY: "auto",
              marginY: isSmallScreen ? "auto" : "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h4" sx={{ color: "text.primary" }}>
                Welcome to Mr.Engineer! 👋
              </Typography>
              <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === "dark" ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ mb: 4, color: "text.secondary" }}>
              Please sign-in to your account and start the adventure
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register("username")}
                label="Email or Username"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: 2 }}
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
                sx={{ mb: 2 }}
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
                  <Checkbox />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Remember Me
                  </Typography>
                </Box>
                <Link
                  href="/u/forgotPassword"
                  variant="body2"
                  sx={{ color: "primary.main" }}
                >
                  Forgot Password?
                </Link>
              </Box>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <Typography
              variant="body2"
              align="center"
              sx={{ mb: 2, color: "text.secondary" }}
            >
              New on our platform?{" "}
              <Link href="/u/register" sx={{ color: "primary.main" }}>
                Create an account
              </Link>
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{ mb: 2, color: "text.secondary" }}
            >
              or
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Facebook sx={{ color: "#497CE2" }} />
              <Twitter sx={{ color: "#1DA1F2" }} />
              <GitHub
                sx={{ color: mode === "light" ? "#333333" : "#ffffff" }}
              />
              <Google sx={{ color: "#DB4437" }} />
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default LoginPage;

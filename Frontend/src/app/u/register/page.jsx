"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  TextField,
  Typography,
  Link,
  useTheme,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { apiResponse } from "@/api/api";
import { useDispatch } from "react-redux";
import { initialUser } from "@/lib/features/user/userSlice";
import Image from "next/image";

const formSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(2, "Username must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("light");
  const router = useRouter();
  const dispatch = useDispatch();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await apiResponse({
        method: "POST",
        endpoint: "/auth/register",
        data,
      });

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Theme toggle button */}
        <IconButton
          sx={{ position: "absolute", top: 16, right: 16 }}
          onClick={toggleColorMode}
          color="inherit"
        >
          {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>

        {/* Left side - Gradient Background */}
        {!isMobile && (
          // <Box
          //   sx={{
          //     flex: isTablet ? "0 0 40%" : "0 0 50%",
          //     background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          //     display: "flex",
          //     flexDirection: "column",
          //     justifyContent: "center",
          //     alignItems: "center",
          //     p: 4,
          //     color: "white",
          //   }}
          // >
          //   <Typography variant="h2" sx={{ mb: 4 }}>
          //     Mr.Engineer
          //   </Typography>
          //   <Typography variant="h4" sx={{ mb: 2 }}>
          //     Join Our Community
          //   </Typography>
          //   <Typography variant="body1" align="center">
          //     Embark on an exciting journey of learning and innovation with
          //     Mr.Engineer.
          //   </Typography>
          // </Box>

          <Box
            sx={{
              flex: isMobile ? "none" : 1,
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
            {!isMobile && (
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
        )}

        {/* Right side - Register Form */}
        <Box
          sx={{
            flex: isMobile ? 1 : isTablet ? "0 0 60%" : "0 0 50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 4,
            bgcolor: "background.paper",
            overflowY: "auto",
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, color: "text.primary" }}>
            Adventure starts here 🚀
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, color: "text.secondary" }}>
            Make your app management easy and fun!
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("username")}
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              {...register("email")}
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
              error={!!errors.email}
              helperText={errors.email?.message}
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

            <TextField
              {...register("confirmPassword")}
              label="Confirm Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Checkbox />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                I agree to{" "}
                <Link href="#" sx={{ color: "primary.main" }}>
                  privacy policy & terms
                </Link>
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>
          </form>

          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 2, color: "text.secondary" }}
          >
            Already have an account?{" "}
            <Link href="/u/login" sx={{ color: "primary.main" }}>
              Sign in instead
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
            <Facebook sx={{ color: "#497ce2" }} />
            <Twitter sx={{ color: "#1da1f2" }} />
            <GitHub sx={{ color: "text.primary" }} />
            <Google sx={{ color: "#db4437" }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default RegisterPage;

"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  Button,
  Link,
  FormControlLabel,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import Spline from "@splinetool/react-spline";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { apiResponse } from "@/api/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { initialUser } from "@/lib/features/user/userSlice";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const { handleSubmit } = useForm();

  const onSubmit = () => {};

  const RightWrapper = styled(Box)(({ theme }) => ({
    width: "100%",
    [theme.breakpoints.up("md")]: {
      maxWidth: 450,
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: 600,
    },
    [theme.breakpoints.up("xl")]: {
      maxWidth: 750,
    },
  }));

  return (
    <Box
      className="content-right"
      sx={{
        display: "flex",
        flexDirection: hidden ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
        minHeight: "100vh",
      }}
    >
      {!hidden && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
          }}
        >
          <Spline scene="https://prod.spline.design/0wRMrgWuEWssh3az/scene.splinecode" />
        </Box>
      )}
      <RightWrapper>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 500,
            padding: theme.spacing(4),
            [theme.breakpoints.up("md")]: {
              padding: theme.spacing(6),
            },
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Typography variant="h4" component="h1">
            Get started!
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
            Please sign-up to your account and start the adventure
          </Typography>
          <TextField
            label="username"
            variant="outlined"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          <TextField
            label="email"
            variant="outlined"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          <TextField
            label="password"
            variant="outlined"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: "white" }}
                  ></IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="confirm password"
            variant="outlined"
            margin="normal"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: "white" }}
                  ></IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{
              mt: 2,
              mb: 2,
              bgcolor: "#00BFFF",
              "&:hover": {
                bgcolor: "#00A0E0",
              },
            }}
          >
            register
          </Button>

          <Typography variant="body2" align="center">
            Already have an account?{" "}
            <Link href="/u/login" underline="always" sx={{ color: "#00BFFF" }}>
              sign in
            </Link>
          </Typography>
        </Box>
      </RightWrapper>
    </Box>
  );
};

export default Register;

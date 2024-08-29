// "use client";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { Button } from "@/components/ui/button";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { Form } from "@/components/ui/form";
// import CustomInput from "@/components/common/customInput";
// import { apiResponse } from "@/api/api";
// import { useDispatch } from "react-redux";
// import { initialUser } from "@/lib/features/user/userSlice";

// const formSchema = yup.object({
//   username: yup
//     .string()
//     .trim()
//     .required("Username is required")
//     .min(2, "Username must be at least 2 characters."),
//   password: yup
//     .string()
//     .trim()
//     .required("Password is required")
//     .min(8, "Password must be at least 8 characters"),
// });

// export default function Login() {
//   const dispatch = useDispatch();
//   const form = useForm({
//     resolver: yupResolver(formSchema),
//     mode: "onChange",
//   });

//   const router = useRouter();
//   const onSubmit = async (data) => {
//     try {
//       const response = await apiResponse({
//         method: "POST",
//         endpoint: "/auth/login",
//         data,
//       });

//       if (response.data?.success) {
//         dispatch(initialUser(response.data.user));
//         toast.success("Logged In Successfully!");

//         document.cookie = `token=${response.data.token};expires=${new Date(
//           Date.now() + 100 * 60 * 60 * 1000
//         ).toUTCString()};path=/;`;
//         router.push("/dashboard");
//       } else {
//         toast.error(response.data?.message);
//       }
//     } catch (error) {
//       toast.error("LogIn failed. Please try again later.");
//     }
//   };

//   return (
//     <section className="min-h-screen flex items-centerdark:bg-black justify-center py-12 bg-background text-foreground transition duration-300 ease-in-out">
//       <div className="w-full max-w-lg bg-card shadow-lg rounded-lg p-10 dark:bg-gray-800 dark:text-white">
//         <div className="text-center mb-8">
//           <Link
//             href="/"
//             className="text-4xl font-extrabold text-blue-700 dark:text-blue-800"
//           >
//             Mr. Engineers
//           </Link>
//         </div>
//         <h1 className="text-3xl font-semibold text-center mb-6 dark:text-gray-100">
//           LogIn to Your Account
//         </h1>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             <CustomInput
//               control={form.control}
//               errors={form.formState.errors}
//               name="username"
//               label="Username"
//               placeholder="Enter your Username"
//             />
//             <CustomInput
//               control={form.control}
//               errors={form.formState.errors}
//               name="password"
//               type="password"
//               label="Password"
//               placeholder="Enter your Password"
//             />
//             <div className="text-end mt-4 text-sm text-muted-foreground dark:text-gray-400">
//               <Link
//                 href="/u/forgotPassword"
//                 className="text-blue-600 hover:underline dark:text-blue-400"
//               >
//                 Forgot Password?
//               </Link>
//             </div>
//             <Button
//               type="submit"
//               className="w-full py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
//             >
//               Login
//             </Button>
//             <div className="text-center mt-4 text-sm text-muted-foreground dark:text-gray-400">
//               <p>
//                 Don't have an account?{" "}
//                 <Link
//                   href="/u/register"
//                   className="text-blue-600 hover:underline dark:text-blue-400"
//                 >
//                   Create one
//                 </Link>
//               </p>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </section>
//   );
// }

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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";
import Spline from "@splinetool/react-spline";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { apiResponse } from "@/api/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { initialUser } from "@/lib/features/user/userSlice";

// Validation schema
const schema = yup.object().shape({
  email: yup
    .string()
    // .email("Invalid email")
    .required("Email is a required field"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is a required field"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

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

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    console.log(data);
    // Handle form submission logic here

    try {
      const res = await apiResponse({
        method: "POST",
        url: "/auth/login",
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
    } catch (e) {
      toast.error("LogIn failed. Please try again later.");
    }
  };

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
        // padding: theme.spacing(4),
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
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back!
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Please sign-in to your account and start the adventure
          </Typography>

          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                variant="outlined"
                margin="normal"
                fullWidth
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ""}
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
            )}
          />

          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                variant="outlined"
                margin="normal"
                fullWidth
                type={showPassword ? "text" : "password"}
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{ color: "white" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
            )}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              my: 2,
            }}
          >
            <FormControlLabel
              control={
                <Controller
                  name="rememberMe"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={field.value}
                      sx={{
                        color: "#00BFFF",
                        "&.Mui-checked": {
                          color: "#00BFFF",
                        },
                      }}
                    />
                  )}
                />
              }
              label="Remember Me"
            />
            <Link href="#" underline="always" sx={{ color: "#00BFFF" }}>
              Forgot Password?
            </Link>
          </Box>

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
            Login
          </Button>

          <Typography variant="body2" align="center">
            New on our platform?{" "}
            <Link href="#" underline="always" sx={{ color: "#00BFFF" }}>
              Create an account
            </Link>
          </Typography>
        </Box>
      </RightWrapper>
    </Box>
  );
};

export default LoginPage;

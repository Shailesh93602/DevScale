// "use client";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { fetchData } from "@/app/services/fetchData";
// import { apiResponse } from "@/api/api";

// const formSchema = yup.object({
//   username: yup
//     .string()
//     .trim()
//     .required("Username is required")
//     .min(2, "Username must be at least 2 characters."),
//   email: yup
//     .string()
//     .trim()
//     .required("Email is required")
//     .email("Please enter a valid email address"),
//   password: yup
//     .string()
//     .trim()
//     .required("Password is required")
//     .min(8, "Password must be at least 8 characters"),
//   confirmPassword: yup
//     .string()
//     .trim()
//     .required("Confirm Password is required")
//     .oneOf([yup.ref("password")], "Passwords must match"),
// });

// export default function Register() {
//   const form = useForm({
//     resolver: yupResolver(formSchema),
//     mode: "onChange",
//   });

//   const router = useRouter();

//   const onSubmit = async (data) => {
//     try {
//       const response = await apiResponse({
//         method: "POST",
//         endpoint: "/auth/register",
//         data: JSON.stringify(data),
//       });
//       if (response.data.success) {
//         toast.success("Registered Successfully!");
//         setTimeout(() => {
//           router.push("/u/login");
//         }, 1000);
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       toast.error("Registration failed. Please try again later.");
//     }
//   };

//   return (
//     <section className="min-h-screen flex items-center justify-center py-12 bg-background text-foreground transition duration-300 ease-in-out">
//       <div className="w-full max-w-lg bg-card shadow-lg rounded-lg p-10 dark:bg-card-dark dark:text-card-foreground-dark">
//         <div className="text-center mb-8">
//           <Link
//             href="/"
//             className="text-4xl font-extrabold text-blue-700 dark:text-blue-800"
//           >
//             Mr. Engineers
//           </Link>
//         </div>
//         <h1 className="text-3xl font-semibold text-center mb-6 dark:text-gray-100">
//           Create Your Account
//         </h1>
//         <Form {...form} className="space-y-6">
//           <form onSubmit={form.handleSubmit(onSubmit)}>
//             <FormField
//               control={form.control}
//               name="username"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Username</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Create a username" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter your Email address" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="password"
//                       placeholder="Enter your password"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="confirmPassword"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Confirm Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="password"
//                       placeholder="Enter your password again"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button
//               type="submit"
//               className="w-full py-3 mt-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out"
//             >
//               Register
//             </Button>
//             <div className="text-center mt-4 text-sm text-muted-foreground dark:text-gray-400">
//               <p>
//                 Already have an account?{" "}
//                 <Link
//                   href="/u/login"
//                   className="text-blue-600 hover:underline dark:text-blue-400"
//                 >
//                   Login here
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
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
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
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </RightWrapper>
    </Box>
  );
};

export default Register;

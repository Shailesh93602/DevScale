"use client";
import * as React from "react";
import { Attribute, ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  attribute?: Attribute;
  defaultTheme?: string;
    enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

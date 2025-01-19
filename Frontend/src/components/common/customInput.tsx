/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { Control, FieldErrors } from "react-hook-form";

export default function CustomInput({
  control,
  errors,
  name,
  type = "text",
  label,
  placeholder,
}: {
  control: Control<any, any>;
  errors: FieldErrors;
  name: string;
  type?: string;
  label?: string;
  placeholder?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              className={`${errors && errors[name] && "border-red-600"}`}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CustomSelect({
  control,
  errors,
  name,
  label,
  placeholder,
  options,
}: {
  control: Control<
    {
      [x: string]: string;
    },
    any
  >;
  errors: FieldErrors;
  name: string;
  label?: string;
  placeholder?: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger
                className={`${errors && errors[name] && "border-red-600"}`}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem value={option.value} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

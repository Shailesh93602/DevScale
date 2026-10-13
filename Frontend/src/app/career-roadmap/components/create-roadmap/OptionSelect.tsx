import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Option {
  value: string;
  label: string;
}

/** The shared look of every select in the create-roadmap form. */
export function OptionSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder: string;
  options: Option[];
}) {
  return (
    <Select onValueChange={onChange} value={value || ''}>
      <SelectTrigger className="bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

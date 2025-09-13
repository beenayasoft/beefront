import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DateInput({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  disabled = false,
  className,
}: DateInputProps) {
  // Convertir Date en string pour l'input
  const dateString = value ? format(value, "yyyy-MM-dd") : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
      const date = new Date(dateStr);
      onChange?.(date);
    } else {
      onChange?.(undefined);
    }
  };

  return (
    <div className="relative">
      <Input
        type="date"
        value={dateString}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "w-full pl-10",
          className
        )}
        placeholder={placeholder}
      />
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
  className?: string;
}

export function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  autoComplete,
  icon: Icon,
  error,
  success,
  className,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className={cn("space-y-2", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Label
        htmlFor={id}
        className={cn(
          "text-gray-700 font-medium transition-colors duration-200",
          isFocused && "text-indigo-600",
        )}
      >
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <motion.div
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            initial={{ opacity: 0.7 }}
            animate={{
              opacity: isFocused ? 1 : 0.7,
              scale: isFocused ? 1.1 : 1,
              color: isFocused ? "#4f46e5" : "#6366f1",
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full py-3 border transition-all duration-200",
            Icon && "pl-10",
            isFocused && "border-indigo-500 ring-2 ring-indigo-100",
            error && "border-red-300 ring-2 ring-red-100",
            success && "border-green-300 ring-2 ring-green-100",
            "rounded-lg focus:outline-none shadow-sm",
          )}
        />
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface CustomInputProps {
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
  title: string;
  placeholder: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  type?: string;
  ariaInvalid?: boolean;
  isPassword?: boolean;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      title,
      placeholder,
      helperText,
      errorMessage,
      required,
      type = "text",
      ariaInvalid,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState(value || "");

    const handleClearInput = () => {
      setInputValue("");
      if (onChange) {
        onChange({
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <div className="space-y-0.5">
        <label
          htmlFor={name}
          className="font-[700] text-[14px] leading-[25px] font-sans text-foreground "
        >
          {title}
        </label>
        <div className="relative">
          <input
            id={name}
            type={showPassword ? "text" : type}
            name={name}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (onChange) {
                onChange(e);
              }
            }}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            ref={ref}
            aria-invalid={ariaInvalid ? "true" : "false"}
            aria-describedby={
              errorMessage
                ? `${name}-error`
                : helperText
                ? `${name}-helper`
                : undefined
            }
            className="px-3 py-2 border rounded-md w-full h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {/* Cross button to clear input, not shown for password field */}
          {inputValue && type !== "password" && (
            <button
              type="button"
              onClick={handleClearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 cursor-pointer"
            >
              <span className="text-sm leading-none">×</span>
            </button>
          )}
        </div>
        {helperText && (
          <p className="text-xs text-muted-foreground" id={`${name}-helper`}>
            {helperText}
          </p>
        )}
        {errorMessage && (
          <p className="text-xs text-red-500" id={`${name}-error`}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;

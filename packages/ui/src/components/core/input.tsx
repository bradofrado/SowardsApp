import React from "react";
import { CheckmarkIcon } from "./icons";
import { Label } from "./label";

interface InputProps {
  onChange?: (value: string) => void;
	onBlur?: (value: string) => void;
  value?: string | number | readonly string[] | undefined;
  className?: string;
  type?: "input" | "textarea" | "password" | "email";
  label?: string;
  placeholder?: string;
  required?: boolean;
}
export const Input: React.FunctionComponent<InputProps> = ({
  onChange,
	onBlur,
  value,
  className,
  label,
  type = "input",
  placeholder,
  required,
}) => {
  const props = {
    className: `${
      className || ""
    } bg-gray-50 border shadow-sm rounded-md px-3  py-1.5 text-sm text-gray-900 focus:ring-primary focus:ring-1 transition-[box-shadow] focus-visible:outline-none `,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      onChange && onChange(e.target.value);
    },
		onBlur: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			onBlur && onBlur(e.target.value);
		},
    placeholder,
    required,
  };
  const input =
    type === "textarea" ? (
      <textarea {...props} value={value} />
    ) : (
      <input {...props} type={type} value={value} />
    );
  if (label) {
    return <Label label={label}>{input}</Label>;
  }
  return input;
};

export interface CheckboxInputProps {
  className?: string;
  value: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
}
export const CheckboxInput: React.FunctionComponent<CheckboxInputProps> = ({
  value,
  onChange,
  label,
  className,
}) => {
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange && onChange(e.target.checked);
  };

  const input = (
    <div
      className={`${
        value ? "bg-primary" : "bg-gray-100"
      } ${className} text-blue-600 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer relative`}
    >
      <input
        checked={value}
        className="absolute top-0 left-0 opacity-0"
        onChange={onInputChange}
        type="checkbox"
      />
      <CheckmarkIcon
        className={`w-4 h-4 fill-white ${value ? "visible" : "invisible"}`}
      />
    </div>
  );
  if (label) {
    return <Label label={label}>{input}</Label>;
  }

  return input;
};

/* eslint-disable @typescript-eslint/no-confusing-void-expression -- ok*/
/* eslint-disable react/button-has-type -- ok*/
import React, { useEffect, useState } from "react";
import { CheckmarkIcon } from "./icons";
import { Label } from "./label";
import { usePrevious } from "../../hooks/previous";

interface InputProps {
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  value?: string | number | readonly string[] | undefined;
  className?: string;
  type?: "input" | "textarea" | "password" | "email";
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
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
  disabled,
}) => {
  const props = {
    className: `${
      className || ""
    } bg-white border shadow-sm rounded-md px-3  py-1.5 text-sm text-gray-900 focus:ring-primary focus:ring-1 transition-[box-shadow] focus-visible:outline-none disabled:bg-gray-100`,
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
      <textarea {...props} value={value} disabled={disabled} />
    ) : (
      <input {...props} type={type} value={value} disabled={disabled} />
    );
  if (label) {
    return <Label label={label}>{input}</Label>;
  }
  return input;
};

export const InputBlur: React.FunctionComponent<Omit<InputProps, "onBlur">> = ({
  onChange,
  value: valueProps,
  ...rest
}) => {
  const [value, setValue] = useState(valueProps);
  const prevValue = usePrevious(valueProps);

  useEffect(() => {
    if (prevValue !== valueProps) {
      setValue(valueProps);
    }
  }, [prevValue, valueProps]);

  const onInputChange = (_value: string): void => {
    setValue(_value);
  };
  return (
    <Input {...rest} value={value} onChange={onInputChange} onBlur={onChange} />
  );
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

interface NumberStepperInputProps {
  value: number;
  onChange: (value: number) => void;
}
export const NumberStepperInput: React.FunctionComponent<
  NumberStepperInputProps
> = ({ value: valueProp, onChange: onChangeProps }) => {
  const [value, setValue] = useState(String(valueProp));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _value = e.target.value;
    setValue(_value);
  };

  const changeValue = (newVal: number) => {
    const _newVal = Math.min(Math.max(0, newVal), 99);
    setValue(String(_newVal));
    onChangeProps(_newVal);
  };

  const onBlur = () => {
    let num = parseInt(value);
    if (isNaN(num)) {
      num = valueProp;
    }

    changeValue(num);
  };

  return (
    <div className="flex rounded-[3px] border border-gray-400 items-center overflow-auto w-fit">
      <button
        className="hover:bg-gray-100 py-[1px] px-2.5 border-r border-gray-400"
        onClick={() => changeValue(valueProp - 1)}
      >
        -
      </button>
      <input
        className="px-1.5 text-sm py-[1px] border-none w-8 focus:ring-0"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      <button
        className="hover:bg-gray-100 py-[1px] px-2.5 border-l border-gray-400"
        onClick={() => changeValue(valueProp + 1)}
      >
        +
      </button>
    </div>
  );
};

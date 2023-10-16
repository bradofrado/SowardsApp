import { useState } from "react";
import { EmailSchema, type Login } from "model/src/auth";

import { Button } from "../../components/core/button";
import { Input } from "../../components/core/input";

export interface LoginFormProps {
  error?: string | null;
  onSubmit: (user: Login) => void;
  setError: (error: string | null) => void;
}
export const LoginForm: React.FunctionComponent<LoginFormProps> = ({
  onSubmit: onSubmitProps,
  error,
  setError,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const emailParsed = EmailSchema.safeParse(email);
    if (emailParsed.success) {
      onSubmitProps({ email: emailParsed.data, password });
    } else {
      setError("Invalid email");
    }
  };

  const onChange = (func: (val: string) => void) => {
    return (val: string) => {
      setError(null);
      func(val);
    };
  };
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <div className="mt-2">
          <Input
            className="w-full block"
            label="Email address"
            onChange={onChange(setEmail)}
            required
            value={email}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            className="block text-sm font-medium leading-6 text-gray-900"
            htmlFor="password"
          >
            Password
          </label>
          {/* <div className="text-sm">
                        <Hyperlink>Forgot password?</Hyperlink>
                    </div> */}
        </div>
        <div className="mt-1">
          <Input
            className="w-full block"
            onChange={onChange(setPassword)}
            required
            type="password"
            value={password}
          />
        </div>
        {error ? <div className="text-red-600 mt-1">{error}</div> : null}
      </div>
      <div>
        <Button className="w-full" mode="primary" type="submit">
          Sign in
        </Button>
      </div>
    </form>
  );
};

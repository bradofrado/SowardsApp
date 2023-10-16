import { useEffect, useState } from "react";
import type { Signup } from "model/src/auth";

import { Button } from "../../components/core/button";
import { Input } from "../../components/core/input";

interface SignupFormComponentProps {
  onSubmit: (user: Signup) => void;
  error?: string | null;
}
export const SignupForm = ({
  onSubmit: onSubmitProps,
  error: errorProps,
}: SignupFormComponentProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(errorProps ?? null);
  }, [errorProps]);

  const validate = (): boolean => {
    if (password !== confirm) {
      setError("Password and confirm password must match");
      return false;
    }

    return true;
  };

  const onChange = (func: (val: string) => void) => {
    return (val: string) => {
      setError(null);
      func(val);
    };
  };

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    validate() && onSubmitProps({ name, email, password });
  };
  return (
    <form className="" onSubmit={onSubmit}>
      <div className="mt-2">
        <Input
          className="w-full block"
          label="Name"
          onChange={onChange(setName)}
          required
          value={name}
        />
      </div>
      <div className="mt-2">
        <Input
          className="w-full block"
          label="Email"
          onChange={onChange(setEmail)}
          required
          type="email"
          value={email}
        />
      </div>
      <div className="mt-2">
        <Input
          className="w-full block"
          label="Password"
          onChange={onChange(setPassword)}
          required
          type="password"
          value={password}
        />
      </div>
      <div className="mt-2">
        <Input
          className="w-full block"
          label="Confirm Password"
          onChange={onChange(setConfirm)}
          required
          type="password"
          value={confirm}
        />
      </div>
      {error ? <div className="mt-1 text-red-600">{error}</div> : null}
      <div className="mt-6">
        <Button className="w-full" mode="primary" type="submit">
          Sign up
        </Button>
      </div>
    </form>
  );
};

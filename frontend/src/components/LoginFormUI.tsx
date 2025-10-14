//UI only
import React from "react";

type Props = {
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  loading?: boolean;
  error?: string | null;
};

export const LoginForm: React.FC<Props> = ({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  onGoogleSignIn,
  loading = false,
  error = null,
}) => {
  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 400 }}>
      <label>
        Email
        <input type="email" value={email} onChange={e => onEmailChange(e.target.value)} required />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={e => onPasswordChange(e.target.value)} required />
      </label>
      {error && <div role="alert">{error}</div>}
      <button type="submit" disabled={loading}>Sign in</button>
      <button type="button" onClick={onGoogleSignIn} disabled={loading}>
        Sign in with Google
      </button>
    </form>
  );
};

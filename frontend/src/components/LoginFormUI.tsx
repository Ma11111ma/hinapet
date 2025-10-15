// frontend/src/components/LoginFormUI.tsx
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
  const inputStyle: React.CSSProperties = {
    padding: "0.5rem",
    fontSize: "1rem",
    border: "2px solid #ccc", // 常に枠線表示
    borderRadius: 4,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: "2rem",
        border: "1px solid #ccc",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        backgroundColor: "#fafafa",
      }}
    >
      <label style={{ display: "flex", flexDirection: "column" }}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0070f3")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column" }}>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0070f3")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#ccc")}
        />
      </label>

      {error && (
        <div
          role="alert"
          style={{ color: "red", fontWeight: "bold", fontSize: "0.9rem" }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "0.75rem",
          fontSize: "1rem",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={loading}
        style={{
          padding: "0.75rem",
          fontSize: "1rem",
          backgroundColor: "#db4437",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Sign in with Google"}
      </button>
    </form>
  );
};

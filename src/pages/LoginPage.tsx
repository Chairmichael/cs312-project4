import type { CSSProperties } from "react";
import { Link } from "react-router";
import UserSignInUpForm from "../components/UserSignInUpForm";

interface LoginPageProps {
  formType?: "signin" | "signup";
}

export default function LoginPage({ formType = "signin" }: LoginPageProps) {
  const isSignIn = formType === "signin";
  
  const containerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: '5rem'
  };
  const panelStyle: CSSProperties = {
    padding: '2rem',
    borderRadius: '5px',
  };
  const switchLinkStyle: CSSProperties = {
    marginTop: '1rem',
  };

  return (
    <div style={containerStyle}>
      <div className="login-panel" style={panelStyle}>
        <h2 style={{ marginTop: 0 }}>{isSignIn ? "Sign in" : "Sign up"}</h2>
        <UserSignInUpForm formType={formType} />
        <p style={switchLinkStyle}>
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <Link to={isSignIn ? "/signup" : "/signin"}>
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
import type { SubmitEvent } from "react";

interface UserSignInUpFormProps {
  formType: "signin" | "signup";
}

export default function UserSignInUpForm({ formType }: UserSignInUpFormProps) {
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
  }
  const isSignUp = formType === "signup";

  return (
    <form onSubmit={handleSubmit} className="signinup">
      <label htmlFor="usernameInput">Username:</label>
      <input type="text" id="usernameInput" />
      <label htmlFor="passwordInput">Password:</label>
      <input type="text" id="passwordInput" />
      {isSignUp && (<>
        <label htmlFor="passwordAgainInput">Retype password:</label>
        <input type="text" id="passwordAgainInput" /> </>)
      }
      <button>{isSignUp ? "Sign Up" : "Sign In"}</button>
    </form>
  );
}
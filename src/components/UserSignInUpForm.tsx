import type { SubmitEvent } from "react";
import { validateSignup } from "../util";


interface UserSignInUpFormProps {
  formType: "signin" | "signup";
}

const fromIds = {
  username: 'usernameInput',
  password: 'passwordInput',
  passwordAgain: 'passwordAgainInput',
  fullname: 'userFullName',
};

export default function UserSignInUpForm({ formType }: UserSignInUpFormProps) {
  const isSignUp = formType === "signup";

  function getSignupData() {
    return {
      username: getInputValue(fromIds.username),
      password: getInputValue(fromIds.password),
      passwordAgain: getInputValue(fromIds.passwordAgain),
      fullname: getInputValue(fromIds.fullname),
    };
  }

  function handleInputChange() {
    if (isSignUp) {
      validateSignup(getSignupData());
    }
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const userSignupData = getSignupData();

    if (isSignUp) {
      validateSignup(userSignupData);
    } else {

    }
  }

  function getInputValue(id: string): string {
    const element = document.getElementById(id);
    return element instanceof HTMLInputElement ? element.value : "";
  }

  
  return (
    <form onSubmit={handleSubmit} className="signinup">
      <label htmlFor={fromIds.username}>Username:</label>
      <input type="text" id={fromIds.username} onChange={handleInputChange} />
      <label htmlFor={fromIds.password}>Password:</label>
      <input type="password" id={fromIds.password} onChange={handleInputChange} />
      {isSignUp && (
        <>
          <label htmlFor={fromIds.passwordAgain}>Retype password:</label>
          <input type="password" id={fromIds.passwordAgain} onChange={handleInputChange} />
          <label htmlFor={fromIds.fullname}>Name:</label>
          <input type="text" id={fromIds.fullname} onChange={handleInputChange} />
        </>
      )}
      <button>{isSignUp ? "Sign Up" : "Sign In"}</button>
    </form>
  );
}
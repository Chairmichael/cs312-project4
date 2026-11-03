import { useState, type SubmitEvent } from "react";
import axios from "axios";
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
  const [showError, setShowError] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');

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
      setShowError(true);
      setFormErrorMessage(validateSignup(getSignupData()));
    } else {
      setShowError(false);
    }
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const userSignupData = getSignupData();
    let validationError = '';
    if (isSignUp) {
      validationError = validateSignup(userSignupData);
    } else if (!userSignupData.username.trim() || !userSignupData.password) {
      validationError = 'Username and password are required';
    }

    if (validationError) {
      setShowError(true);
      setFormErrorMessage(validationError);
      return;
    }

    try {
      await axios.post('/auth', {
        action: formType,
        username: userSignupData.username.trim(),
        password: userSignupData.password,
        fullname: userSignupData.fullname.trim(),
      });
      localStorage.setItem('username', userSignupData.username.trim());
      window.location.assign('/');
    } catch (error) {
      const message = axios.isAxiosError(error) && typeof error.response?.data?.error === 'string'
        ? error.response.data.error
        : 'Unable to authenticate. Please try again.';
      setFormErrorMessage(message);
      setShowError(true);
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
      {showError && <span style={{ color: 'brown' }}> {formErrorMessage} </span>}
      <button>{isSignUp ? "Sign Up" : "Sign In"}</button>
    </form>
  );
}
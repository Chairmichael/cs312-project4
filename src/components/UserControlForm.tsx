import type { SubmitEvent } from "react";

export default function UserControlForm() {
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
  }
  return (
    <form onSubmit={handleSubmit}>
      
    </form>
  );
}
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthHeader, LoginForm, RegistrationForm } from "../src/auth";
function Demo() {
  const [page, setPage] = useState<"login" | "registration">("login");
  const header = (
    <>
      <nav>
        <button type="button" onClick={() => setPage("login")}>
          Login demo
        </button>{" "}
        <button type="button" onClick={() => setPage("registration")}>
          Registration demo
        </button>
      </nav>
      <AuthHeader
        title={
          page === "login" ? "Access your dashboard" : "Register your school"
        }
        description="Local demo only. No accounts are created and no files are uploaded."
      />
    </>
  );
  return page === "login" ? (
    <LoginForm header={header} onLogin={async () => {}} />
  ) : (
    <RegistrationForm
      header={header}
      onRegister={async () => ({ schoolCode: "DEMO-001" })}
      onLogin={() => setPage("login")}
    />
  );
}
createRoot(document.getElementById("root")!).render(<Demo />);

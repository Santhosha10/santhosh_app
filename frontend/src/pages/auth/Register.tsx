import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../../hooks/AuthHook";
import { authService } from "../../services/auth.service";
import type { RegisterPayload } from "../../types";

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.error;
    return typeof message === "string" ? message : "Unable to create account";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create account";
};

export default function Register() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: RegisterPayload) =>
      authService.register({ name, email, password }),

    onSuccess: (userResponse) => {
      queryClient.setQueryData(["user"], userResponse);
      setUser(userResponse);
      navigate("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    registerMutation.mutate({
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    });
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start with your name, email, and a secure password."
      asideTitle="Set up access for your app in a few seconds."
      asideText="Registration creates a Prisma-backed user record, stores a hashed password, and signs you in with a JWT."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#344054]">
            Full name
          </span>
          <input
            className="h-12 w-full rounded-lg border border-[#cfd6df] bg-white px-4 text-sm text-[#17202a] outline-none transition focus:border-[#0f6b5d] focus:ring-4 focus:ring-[#0f6b5d]/12"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Enter Your Name"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#344054]">
            Email address
          </span>
          <input
            className="h-12 w-full rounded-lg border border-[#cfd6df] bg-white px-4 text-sm text-[#17202a] outline-none transition focus:border-[#0f6b5d] focus:ring-4 focus:ring-[#0f6b5d]/12"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#344054]">
            Password
          </span>
          <input
            className="h-12 w-full rounded-lg border border-[#cfd6df] bg-white px-4 text-sm text-[#17202a] outline-none transition focus:border-[#0f6b5d] focus:ring-4 focus:ring-[#0f6b5d]/12"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={1}
            maxLength={64}
            required
          />
        </label>

        {registerMutation.isError ? (
          <div className="rounded-lg border border-[#f2b8b5] bg-[#fff4f2] px-4 py-3 text-sm text-[#b42318]">
            {getErrorMessage(registerMutation.error)}
          </div>
        ) : null}

        <button
          className="h-12 w-full rounded-lg bg-[#0f6b5d] px-4 text-sm font-semibold text-white transition hover:bg-[#0b5b4f] disabled:cursor-not-allowed disabled:bg-[#9bbab4]"
          type="submit"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../../hooks/AuthHook";
import { authService } from "../../services/auth.service";
import type { LoginPayload } from "../../types";

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.error;
    return typeof message === "string" ? message : "Unable to sign in";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to sign in";
};

export default function Login() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginPayload) =>
      authService.login({ email, password }),

    onSuccess: (userResponse) => {
      queryClient.setQueryData(["user"], userResponse);
      setUser(userResponse);
      navigate("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    loginMutation.mutate({
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your email and password to continue to your dashboard."
      asideTitle="Manage your account from one focused workspace."
      asideText="A clean authentication flow connected to your Express API, Prisma models, and protected app routes."
      footerText="New here?"
      footerLinkText="Create an account"
      footerLinkTo="/register"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            placeholder="Enter your password"
            minLength={1}
            maxLength={64}
            required
          />
        </label>

        {loginMutation.isError ? (
          <div className="rounded-lg border border-[#f2b8b5] bg-[#fff4f2] px-4 py-3 text-sm text-[#b42318]">
            {getErrorMessage(loginMutation.error)}
          </div>
        ) : null}

        <button
          className="h-12 w-full rounded-lg bg-[#0f6b5d] px-4 text-sm font-semibold text-white transition hover:bg-[#0b5b4f] disabled:cursor-not-allowed disabled:bg-[#9bbab4]"
          type="submit"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}

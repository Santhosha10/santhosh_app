import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { LoginPayload } from "../types";
import { useAuth } from "../hooks/AuthHook";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginPayload) =>
      authService.login({ email, password }),

    onSuccess: (userResponse) => {
      queryClient.setQueryData(["user"], userResponse);
      if (userResponse) {
        setUser(userResponse);
        navigate("/dashboard");
      }
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    loginMutation.mutate({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Login Page</h1>

      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

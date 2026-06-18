import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/AuthHook";
import { authService } from "../../services/auth.service";

export default function AuthenticatedLayout() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = () => {
    setIsLoggingOut(true);
    authService.logout();
    queryClient.removeQueries({ queryKey: ["user"] });

    window.setTimeout(() => {
      setUser(null);
      navigate("/login", { replace: true });
    }, 200);
  };

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="font-semibold">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-70 hover:bg-red-600"
        >
          {isLoggingOut && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}

          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

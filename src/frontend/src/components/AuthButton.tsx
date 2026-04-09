import { createActor } from "@/backend";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";

export function AuthButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { actor, isFetching: isActorFetching } = useActor(createActor);

  const isAuthenticated = !!identity;
  const isPending = loginStatus === "logging-in";

  const { data: isAdmin } = useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: isAuthenticated && !!actor && !isActorFetching,
    staleTime: 30_000,
  });

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const e = error as Error;
      if (e.message === "User is already authenticated") {
        await clear();
        queryClient.clear();
        setTimeout(() => login(), 300);
      } else {
        console.error("Login error:", error);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5" data-ocid="auth-status">
        {/* Admin badge — only shown when isCallerAdmin() returns true */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25">
            <ShieldCheck
              size={13}
              className="text-primary"
              aria-hidden="true"
            />
            <span className="text-xs font-semibold tracking-wide text-primary">
              Admin
            </span>
          </div>
        )}
        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
          aria-label="Abmelden"
          data-ocid="logout-btn"
        >
          <LogOut size={13} aria-hidden="true" />
          <span className="hidden xs:inline">Abmelden</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-card transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Anmelden mit Internet Identity"
      data-ocid="login-btn"
    >
      <LogIn size={13} aria-hidden="true" />
      {isPending ? "…" : "Anmelden"}
    </button>
  );
}

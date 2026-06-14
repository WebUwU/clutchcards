"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

// Session-based gate. Middleware already protects /admin server-side; this
// provides a smooth client experience and redirects non-admins.
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
    else if (status === "authenticated" && role !== "admin") router.replace("/dashboard");
  }, [status, role, router]);

  if (status === "loading" || status === "unauthenticated" || role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-slate-500" />
      </div>
    );
  }
  return <>{children}</>;
}

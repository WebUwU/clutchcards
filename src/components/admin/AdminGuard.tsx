"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/adminAuth";
import { Loader2 } from "lucide-react";

/** Client-side gate. Redirects to /admin/login when not authenticated. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "allowed">("checking");

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setState("allowed");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  if (state === "checking") {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-slate-500" />
      </div>
    );
  }
  return <>{children}</>;
}

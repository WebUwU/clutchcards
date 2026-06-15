"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "./AdminCardsSection";
import { AdminTable, Column } from "../AdminTable";
import { api } from "@/lib/apiClient";
import { useToast } from "@/components/ui/Toast";
import { formatNumber } from "@/lib/utils";

interface AdminUser {
  id: string; email: string | null; role: string; username: string;
  level: number; freeCoins: number; premiumCoins: number; cardsOwned: number;
  riot: string | null; createdAt: string;
}

export function AdminUsersSection() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    api.adminList("users").then((u) => setUsers(u as AdminUser[]))
      .catch((e) => toast(e instanceof Error ? e.message : "Failed to load users", "error"));
  }, [toast]);

  const columns: Column<AdminUser>[] = [
    { key: "user", header: "User", render: (u) => (
      <div>
        <div className="font-medium text-white">{u.username}</div>
        <div className="font-mono text-[10px] text-slate-500">{u.email ?? "—"}</div>
      </div>
    )},
    { key: "role", header: "Role", render: (u) => (
      <span className={`chip ${u.role === "admin" ? "bg-ascend/15 text-ascend-bright" : "bg-white/5 text-slate-400"}`}>{u.role}</span>
    )},
    { key: "level", header: "Level", render: (u) => <span className="font-mono text-slate-400">{u.level}</span> },
    { key: "coins", header: "Coins", render: (u) => (
      <span className="font-mono text-xs text-slate-400">{formatNumber(u.freeCoins)} FC · {formatNumber(u.premiumCoins)} PC</span>
    )},
    { key: "cards", header: "Cards", render: (u) => <span className="font-mono text-slate-400">{u.cardsOwned}</span> },
    { key: "riot", header: "Riot", render: (u) => <span className="font-mono text-xs text-slate-500">{u.riot ?? "—"}</span> },
  ];

  return (
    <div>
      <SectionHeader title="Users" count={users.length} desc="All registered players, loaded live from the database." />
      <AdminTable rows={users} columns={columns} searchKeys={["username", "email", "riot"]} />
    </div>
  );
}

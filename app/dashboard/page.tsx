import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/DashboardClient";
import type { Recording } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("recordings")
    .select("*")
    .order("created_at", { ascending: false });

  const name = user.email?.split("@")[0] ?? "there";

  return <DashboardClient initial={(data ?? []) as Recording[]} name={name} />;
}
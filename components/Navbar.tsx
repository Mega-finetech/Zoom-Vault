"use client";
import Logo from "@/components/Logo";

import { useRouter } from "next/navigation";
import { LogOut, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export default function Navbar({ search, onSearchChange, onAddClick }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0A0F0D]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <h1 >
            <div className="hidden sm:block">
            <Logo />
            </div>
            <div className="sm:hidden">
            <Logo showText={false} />
            </div>
        </h1>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            suppressHydrationWarning
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search course or title..."
            className="w-full rounded-lg border border-white/10 bg-[#141C18] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#3BCCA3]"
          />
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-lg bg-[#3BCCA3] px-3 py-2 text-sm font-medium text-[#0A0F0D] hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Class</span>
        </button>

        <button
          onClick={handleLogout}
          title="Log out"
          className="rounded-lg border border-white/10 p-2 text-white/60 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
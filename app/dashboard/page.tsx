"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type UserEmail = {
  email?: string;
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<UserEmail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUser({ email: user.email });
      setLoading(false);
    }

    loadUser();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-400">ShadowGate</p>
            <h1 className="mt-2 text-3xl font-bold">Security dashboard</h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-cyan-400"
          >
            Log out
          </button>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-400">Signed in as</p>
          <p className="mt-2 text-lg">{user?.email}</p>
          <button
            onClick={() => router.push("/dashboard/vault")}
            className="mt-6 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Open personal vault
          </button>
        </section>
      </div>
    </main>
  );
}

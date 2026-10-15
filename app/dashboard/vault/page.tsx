"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

type VaultItem = {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function VaultPage() {
  const supabase = createClient();
  const router = useRouter();

  const [items, setItems] = useState<VaultItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    loadVault();
  }, []);

  async function loadVault() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("vault_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Title and content are required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("vault_items").insert({
      owner_id: userId,
      title: title.trim(),
      content: content.trim(),
    });

    if (error) {
      setMessage(error.message);
    } else {
      setTitle("");
      setContent("");
      setMessage("Vault item saved.");
      await loadVault();
    }

    setSaving(false);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) {
      return;
    }

    if (!editingTitle.trim() || !editingContent.trim()) {
      setMessage("Title and content are required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("vault_items")
      .update({
        title: editingTitle.trim(),
        content: editingContent.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Vault item updated.");
      setEditingId(null);
      setEditingTitle("");
      setEditingContent("");
      await loadVault();
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("vault_items").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      setMessage("Vault item deleted.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading vault...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cyan-400">ShadowGate</p>
            <h1 className="mt-2 text-3xl font-bold">Personal vault</h1>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-cyan-400"
          >
            Dashboard
          </button>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Create a vault item</h2>

          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <textarea
              required
              maxLength={10000}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write private content..."
              rows={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save item"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-slate-800 p-3 text-sm text-cyan-300">
              {message}
            </p>
          )}
        </section>

        {editingId && (
          <section className="mt-8 rounded-2xl border border-cyan-900 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit vault item</h2>

              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setEditingTitle("");
                  setEditingContent("");
                }}
                className="text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <input
                type="text"
                required
                maxLength={120}
                value={editingTitle}
                onChange={(event) => setEditingTitle(event.target.value)}
                placeholder="Title"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />

              <textarea
                required
                maxLength={10000}
                value={editingContent}
                onChange={(event) => setEditingContent(event.target.value)}
                placeholder="Content"
                rows={6}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? "Updating..." : "Save changes"}
              </button>
            </form>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Your saved items</h2>

          {items.length === 0 ? (
            <p className="mt-4 text-slate-400">
              You do not have any vault items yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>

                  <p className="mt-3 whitespace-pre-wrap text-slate-300">
                    {item.content}
                  </p>

                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingTitle(item.title);
                      setEditingContent(item.content);
                      setMessage("");
                    }}
                    className="mr-3 mt-5 rounded-lg border border-cyan-800 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-950"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-5 rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950"
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

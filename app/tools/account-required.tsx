"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { AccountState, createFreeAccount } from "../lib/account-store";

type AccountRequiredProps = {
  moduleName: string;
  onCreate: (account: AccountState) => void;
};

export function AccountRequired({ moduleName, onCreate }: AccountRequiredProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    if (!cleanUsername || !cleanEmail) return;
    onCreate(createFreeAccount(cleanEmail, cleanUsername));
    setUsername("");
    setEmail("");
  }

  return (
    <section className="glow-card mt-8 border border-[#f0b35a]/40 bg-[#1a1711] p-5 sm:p-6" data-reveal>
      <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#f0b35a]">Account required</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Create an account to open {moduleName}.</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
        Free accounts get 5 searches each month. After creating one, this exact tool page unlocks immediately.
      </p>

      <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleCreate}>
        <input
          className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm"
          maxLength={18}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="username"
          type="text"
          value={username}
        />
        <input
          className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <button
          className="min-h-11 border border-[#00e0aa]/40 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]"
          disabled={!username.trim() || !email.trim()}
          type="submit"
        >
          Create
        </button>
      </form>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link href="/account/" className="inline-flex min-h-11 items-center justify-center border border-white/16 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white hover:text-black sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]">
          Account page
        </Link>
        <Link href="/cart/" className="inline-flex min-h-11 items-center justify-center border border-white/16 px-5 text-xs font-black uppercase tracking-[0.12em] text-white/62 transition hover:border-white hover:text-white sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]">
          View plans
        </Link>
      </div>
    </section>
  );
}

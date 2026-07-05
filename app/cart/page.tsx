"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { InteractiveEffects } from "../interactive-effects";
import { activateCart, addToCart, CartItem, CartItemId, catalog, clearCart, getAccount, getCart, removeFromCart } from "../lib/account-store";
import { ToolSidebar } from "../tool-sidebar";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    const params = new URLSearchParams(window.location.search);
    const item = params.get("plan") || params.get("pack");
    if (item && item in catalog) {
      window.history.replaceState(null, "", "/cart/");
      return addToCart(item as CartItemId);
    }

    return getCart();
  });
  const currentAccount = getAccount();
  const [username, setUsername] = useState(() => currentAccount?.username ?? "");
  const [email, setEmail] = useState(() => currentAccount?.email ?? "");
  const [message, setMessage] = useState("");

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  function handleAdd(id: CartItemId) {
    setItems(addToCart(id));
    setMessage("");
  }

  function handleRemove(id: CartItemId) {
    setItems(removeFromCart(id));
  }

  function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !username.trim()) return;
    activateCart(email.trim(), username.trim());
    setItems([]);
    setMessage("Checkout prototype complete. Your local account plan is active in this browser.");
  }

  return (
    <main className="min-h-screen bg-[#050607] px-4 py-4 pb-24 text-[#f3f4f0] sm:px-8 lg:px-10 xl:pb-5">
      <InteractiveEffects />
      <ToolSidebar />

      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:px-4">
          <Link href="/" className="flex items-center gap-3" aria-label="OSINT Forge home">
            <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">OF</span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">OSINT Forge</span>
          </Link>
          <Link href="/account/" className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]">
            Account
          </Link>
        </header>

        <section className="py-12 sm:py-20" data-reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]">Cart</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,12vw,4.4rem)] font-semibold leading-[1.02] tracking-normal text-white">
            Subscribe or add investigation credits.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">
            Pick a plan, review the order, and connect Stripe or crypto payments through the Worker when you are ready to accept real purchases.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
                {(["core", "professional", "enterprise"] as CartItemId[]).map((id) => (
                  <article key={id} className="glow-card bg-[#080a0c] p-5">
                    <h2 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">{catalog[id].name}{currentAccount?.plan === id ? <span className="current-plan-badge">[current]</span> : null}</h2>
                    <p className="mt-4 font-mono text-sm text-white/42">{catalog[id].credits} credits / month</p>
                    <p className="mt-3 text-4xl font-semibold">${catalog[id].price}<span className="text-sm text-white/42"> /mo</span></p>
                    <button className="mt-6 inline-flex w-full items-center justify-center border border-[#00e0aa]/40 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black" onClick={() => handleAdd(id)} type="button">
                      Add plan
                    </button>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
                {(["extra-50", "extra-200", "extra-1000"] as CartItemId[]).map((id) => (
                  <article key={id} className="glow-card bg-[#050607] p-5">
                    <h2 className="text-xl font-semibold">{catalog[id].name}</h2>
                    <p className="mt-4 font-mono text-sm text-white/42">{catalog[id].credits} extra credits</p>
                    <p className="mt-3 text-3xl font-semibold">${catalog[id].price}</p>
                    <button className="mt-6 inline-flex w-full items-center justify-center border border-white/16 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white hover:text-black" onClick={() => handleAdd(id)} type="button">
                      Add credits
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <form className="glow-card border border-white/12 bg-[#080a0c] p-5" onSubmit={handleCheckout}>
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#f0b35a]">Order summary</p>
              <div className="mt-5 space-y-3">
                {items.length ? items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 border border-white/10 bg-black/24 p-3">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="mt-1 font-mono text-xs text-white/42">{item.credits} credits</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.price.toFixed(2)}</p>
                      <button className="mt-2 text-xs uppercase tracking-[0.12em] text-white/42 hover:text-white" onClick={() => handleRemove(item.id)} type="button">Remove</button>
                    </div>
                  </div>
                )) : <p className="border border-white/10 bg-black/24 p-4 text-sm text-white/54">Your cart is empty.</p>}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm uppercase tracking-[0.16em] text-white/42">Total</span>
                <strong className="text-3xl">${total.toFixed(2)}</strong>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="checkout-username">Username</label>
                  <input id="checkout-username" className="mt-3 min-h-11 w-full border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm" maxLength={18} onChange={(event) => setUsername(event.target.value)} placeholder="nightcrawler_99" type="text" value={username} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="checkout-email">Account email</label>
                  <input id="checkout-email" className="mt-3 min-h-11 w-full border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
                </div>
              </div>

              <button className="mt-5 inline-flex w-full items-center justify-center border border-[#00e0aa]/40 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black disabled:cursor-not-allowed disabled:opacity-50" disabled={!items.length || !email.trim() || !username.trim()} type="submit">
                Prototype checkout
              </button>
              <button className="mt-3 inline-flex w-full items-center justify-center border border-white/16 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/62 transition hover:border-white hover:text-white" onClick={() => { clearCart(); setItems([]); }} type="button">
                Clear cart
              </button>
              {message ? <p className="mt-4 border border-[#00e0aa]/30 bg-[#00e0aa]/10 px-3 py-2 text-sm leading-6 text-[#9fffe7]">{message}</p> : null}
              <p className="mt-4 text-xs leading-6 text-white/38">Payment collection is not connected yet. This shell is ready for Stripe Checkout and your separate crypto pay service through Cloudflare.</p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}


"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AccountState, getAccount, planLabel, planTierClass } from "./lib/account-store";

export function AccountAccessButton() {
  const [account, setAccount] = useState<AccountState | null>(null);

  useEffect(() => {
    function syncAccount() {
      setAccount(getAccount());
    }

    syncAccount();
    window.addEventListener("storage", syncAccount);
    window.addEventListener("osint-forge-account", syncAccount);

    return () => {
      window.removeEventListener("storage", syncAccount);
      window.removeEventListener("osint-forge-account", syncAccount);
    };
  }, []);

  if (!account) {
    return (
      <a
        href="#pricing"
        className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]"
      >
        Get Access
      </a>
    );
  }

  return (
    <Link
      href="/account/"
      className="account-rank-link border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-[#00e0aa] hover:bg-white/[0.03] sm:px-4 sm:text-xs sm:tracking-[0.14em]"
      title="Open account dashboard"
    >
      <span>{account.username}</span>
      <span className={`subscription-rank ${planTierClass(account.plan)}`}>
        [{planLabel(account.plan)}]
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    </Link>
  );
}

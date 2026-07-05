"use client";

import { useEffect, useState } from "react";

import { AccountState, getAccount, PlanId } from "./lib/account-store";

export function CurrentPlanBadge({ plan }: { plan: PlanId }) {
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

  if (account?.plan !== plan) return null;

  return <span className="current-plan-badge">[current]</span>;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";

// Account details and password. Accounts are paused, resumed and removed by
// a Quadrum admin from the Users page, not by their owners.

const ROLE_LABEL: Record<string, string> = {
  admin: "Client admin: adds controllers to the account and shares their junctions, plus commands and timing.",
  operator: "Operator: sends commands and changes signal timing.",
  viewer: "Viewer: watches junctions live; can't send commands or change timing.",
};

export default function AccountPage({ variant }: { variant: "user" | "admin" }) {
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    setAccount(GetItemFromLocalStorage(variant === "admin" ? "adminUser" : "user"));
  }, [variant]);

  const base = variant === "admin" ? "/admin/dashboard/settings" : "/dashboard/settings";

  return (
    <section className="qtAccount">
      <h2 className="page-header">Account</h2>
      <div className="qtCard qtAccount__card">
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{account?.name || "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{account?.email || "—"}</dd>
          </div>
          {variant === "admin" ? (
            <div>
              <dt>Role</dt>
              <dd>Quadrum admin, department {account?.department || "—"}</dd>
            </div>
          ) : (
            <div>
              <dt>Role</dt>
              <dd>{ROLE_LABEL[account?.role || "admin"]}</dd>
            </div>
          )}
        </dl>
        <div className="qtAccount__actions">
          <Link className="qtButton" href={`${base}/change_password`}>
            Change password
          </Link>
          {variant === "admin" ? (
            <Link className="qtButton qtButton--quiet" href="/admin/dashboard/users">
              Manage users
            </Link>
          ) : null}
        </div>
      </div>
      <p className="qtAccount__note">
        {variant === "admin"
          ? "Client accounts are invited, paused and removed on the Users page."
          : "To change your role, or to pause or close your account, ask your admin or write to hello@quadrumtechnologies.com."}
      </p>
    </section>
  );
}

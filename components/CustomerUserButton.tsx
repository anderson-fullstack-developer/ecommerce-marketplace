"use client";

import { UserButton } from "@clerk/nextjs";
import { Package } from "lucide-react";

// Client Component pelo mesmo motivo que components/conta/AccountProfile.tsx: o Clerk
// ignora <UserButton.MenuItems> vindos de um Server Component.
export function CustomerUserButton() {
  return (
    <UserButton userProfileMode="navigation" userProfileUrl="/conta">
      <UserButton.MenuItems>
        <UserButton.Link
          label="As minhas encomendas"
          labelIcon={<Package className="size-4" />}
          href="/conta#/encomendas"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}

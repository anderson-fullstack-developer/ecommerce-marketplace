"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function CustomerSignOutButton() {
  return (
    <SignOutButton redirectUrl="/">
      <Button variant="outline" size="sm">
        Sair
      </Button>
    </SignOutButton>
  );
}

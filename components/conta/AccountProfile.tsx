"use client";

import type { ReactNode } from "react";
import { UserProfile } from "@clerk/nextjs";
import { LifeBuoy, MapPin, Package } from "lucide-react";

// Tem de ser um Client Component: o Clerk só reconhece <UserProfile.Page> comparando
// child.type === UserProfile.Page, o que falha (e as páginas são ignoradas sem erro)
// quando os filhos vêm de um Server Component. O conteúdo de cada página continua a
// ser renderizado no servidor e chega aqui como props.
export function AccountProfile({
  orders,
  shipping,
  help,
}: {
  orders: ReactNode;
  shipping: ReactNode;
  help: ReactNode;
}) {
  return (
    <UserProfile routing="hash">
      <UserProfile.Page label="account" />
      <UserProfile.Page label="security" />
      <UserProfile.Page
        label="As minhas encomendas"
        labelIcon={<Package className="size-4" />}
        url="encomendas"
      >
        {orders}
      </UserProfile.Page>
      <UserProfile.Page
        label="Morada e contacto"
        labelIcon={<MapPin className="size-4" />}
        url="morada"
      >
        {shipping}
      </UserProfile.Page>
      <UserProfile.Page label="Ajuda" labelIcon={<LifeBuoy className="size-4" />} url="ajuda">
        {help}
      </UserProfile.Page>
    </UserProfile>
  );
}

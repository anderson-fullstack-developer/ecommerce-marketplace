import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { auth } from "@/auth";
import { CartLink } from "@/components/CartLink";

export async function Navbar() {
  const session = await auth();
  const isCustomer = session?.user?.role === "CUSTOMER";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/logo.png"
            alt="Neto STP"
            width={72}
            height={48}
            className="h-12 w-18 rounded-full object-cover"
            priority
          />
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary">
            Início
          </Link>
          <Link href="/loja" className="hover:text-primary">
            Loja
          </Link>
          <Link href="/torna-te-vendedor" className="hidden hover:text-primary sm:inline">
            Torna-te vendedor
          </Link>
          <Link
            href={isCustomer ? "/conta" : "/conta/login"}
            className="flex items-center hover:text-primary"
            aria-label={isCustomer ? "Definições da conta" : "Entrar ou criar conta"}
            title={isCustomer ? "Definições da conta" : "Entrar ou criar conta"}
          >
            <User className="size-5" />
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}

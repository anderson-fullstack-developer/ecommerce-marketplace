import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-2">
            <Image
              src="/brand/logo.png"
              alt="Neto STP"
              width={66}
              height={44}
              className="h-11 w-16 rounded-full object-cover"
            />
            <p className="text-sm text-muted-foreground">
              O melhor de São Tomé e Príncipe, selecionado com cuidado e
              entregue em Portugal.
            </p>
            <p className="text-sm text-muted-foreground">
              <a href="mailto:stpnetosabores@gmail.com" className="hover:text-primary">
                stpnetosabores@gmail.com
              </a>
            </p>
          </div>

          <nav className="flex gap-8 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Loja</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  <Link href="/loja" className="hover:text-primary">
                    Todos os produtos
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Vender</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  <Link href="/torna-te-vendedor" className="hover:text-primary">
                    Torna-te vendedor
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Contacto</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  <Link href="/contacto" className="hover:text-primary">
                    Formulário de contacto
                  </Link>
                </li>
                <li>
                  <Link href="/reclamacoes" className="hover:text-primary">
                    Reclamações
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          © {year} Neto STP. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

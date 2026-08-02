import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { active: true, approvalStatus: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-accent/60 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="text-sm font-medium tracking-widest uppercase opacity-80">
            São Tomé e Príncipe
          </p>
          <h1 className="mt-4 max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Um pouco de tudo das ilhas, à porta de casa
          </h1>
          <p className="mt-4 max-w-xl text-base opacity-90 sm:text-lg">
            O melhor de São Tomé e Príncipe, selecionado com cuidado e
            entregue em Portugal.
          </p>
          <Button
            render={<Link href="/loja" />}
            nativeButton={false}
            size="lg"
            variant="secondary"
            className="mt-8"
          >
            Comprar agora
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 sm:items-center">
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              Um arquipélago de tradição e cultura
            </h2>
            <p className="text-muted-foreground">
              São Tomé e Príncipe, no coração do Golfo da Guiné, é terra de
              solos vulcânicos férteis onde nasceram alguns dos melhores
              cacaus e cafés do mundo — mas também de artesãos, tecelões e
              pequenos produtores que mantêm vivas tradições únicas, do
              artesanato aos tecidos.
            </p>
            <p className="text-muted-foreground">
              A Neto STP nasce para trazer um pouco de tudo isso até Portugal,
              apoiando diretamente quem produz e dando a conhecer o melhor
              do arquipélago.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Café", src: "/produtos/cafe.png" },
              { label: "Cacau", src: "/produtos/cacau.png" },
              { label: "Doces", src: "/produtos/doces.png" },
              { label: "Tecidos", src: "/produtos/tecidos.png" },
            ].map(({ label, src }) => (
              <div
                key={label}
                className="relative flex aspect-square items-end overflow-hidden rounded-xl bg-secondary/60"
              >
                <Image
                  src={src}
                  alt={label}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
                <span className="relative z-10 w-full bg-linear-to-t from-black/60 to-transparent px-3 py-2 font-heading text-lg font-medium text-white">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              Produtos em destaque
            </h2>
            <Link href="/loja" className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Lock, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AddToCartForm } from "@/components/AddToCartForm";
import { cloudinaryResize } from "@/lib/cloudinary-url";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, vendor: true },
  });

  if (!product || !product.active || product.approvalStatus !== "APPROVED") return null;
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Produto não encontrado — Neto STP" };

  return {
    title: `${product.name} — Neto STP`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/loja" className="hover:text-primary">
          Loja
        </Link>
        <span className="mx-2">/</span>
        <span>{product.category.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagens externas, sem Cloudinary ainda (Passo 7) */}
          <img
            src={cloudinaryResize(product.imageUrl, 1000)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              {product.category.name}
            </p>
            <h1 className="mt-1 font-heading text-3xl font-semibold">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Vendido por {product.vendor?.name ?? "Neto STP"}</span>
            <span
              className="flex items-center gap-1 text-primary"
              title={product.vendor ? "Vendedor verificado pela Neto STP" : "Loja oficial"}
            >
              <BadgeCheck className="size-4" />
              <span className="text-xs font-medium">
                {product.vendor ? "Vendedor verificado" : "Loja oficial"}
              </span>
            </span>
          </div>

          <p className="text-2xl font-semibold text-primary">
            €{product.price.toFixed(2)}
          </p>

          <p className="whitespace-pre-line text-muted-foreground">
            {product.description}
          </p>

          <p className="text-sm text-muted-foreground">
            {product.stock <= 0
              ? "Esgotado"
              : `${product.stock} unidades disponíveis`}
          </p>

          <AddToCartForm product={product} />

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
            <div className="flex items-center gap-2.5">
              <Truck className="size-4 shrink-0 text-primary" />
              <span>Envio grátis para todo Portugal em 3 a 5 dias úteis</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              <span>Produto verificado — qualidade garantida</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock className="size-4 shrink-0 text-primary" />
              <span>Pagamento 100% seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

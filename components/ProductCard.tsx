"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cloudinaryResize } from "@/lib/cloudinary-url";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    const result = addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });

    if (result === "maxed") {
      toast.error(`Já tens o máximo em stock de "${product.name}" no carrinho (${product.stock}).`);
      return;
    }
    if (result === "capped") {
      toast.warning(`Só há ${product.stock} unidades de "${product.name}" em stock.`);
      return;
    }
    toast.success(`${product.name} adicionado ao carrinho`);
  }

  return (
    <Card className="group overflow-hidden py-0">
      <Link href={`/produto/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagens externas, sem Cloudinary ainda (Passo 7) */}
          <img
            src={cloudinaryResize(product.imageUrl, 500)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="space-y-1 pt-4">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-heading font-medium leading-snug hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="text-lg font-semibold text-primary">
          €{product.price.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {outOfStock ? "Esgotado" : `${product.stock} em stock`}
        </p>
      </CardContent>
      <CardFooter>
        {outOfStock ? (
          <Button
            render={<Link href={`/produto/${product.slug}`} />}
            nativeButton={false}
            variant="outline"
            className="w-full"
          >
            Ver produto
          </Button>
        ) : (
          <Button onClick={handleAdd} className="w-full">
            Adicionar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

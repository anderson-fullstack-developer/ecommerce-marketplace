"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
      },
      quantity
    );
    toast.success(`${product.name} adicionado ao carrinho`);
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        max={Math.max(product.stock, 1)}
        value={quantity}
        onChange={(event) => {
          const value = Number(event.target.value);
          setQuantity(Math.max(1, Math.min(value || 1, product.stock)));
        }}
        disabled={outOfStock}
        className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
        aria-label="Quantidade"
      />
      <Button disabled={outOfStock} size="lg" onClick={handleAdd}>
        {outOfStock ? "Esgotado" : "Adicionar ao carrinho"}
      </Button>
    </div>
  );
}

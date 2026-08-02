"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/use-cart";

export function ClearCartOnMount() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- correr apenas uma vez, ao montar
  }, []);

  return null;
}

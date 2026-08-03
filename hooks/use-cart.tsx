"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getServerCart,
  addServerCartItem,
  updateServerCartItemQuantity,
  removeServerCartItem,
  clearServerCart,
  mergeLocalCartIntoServer,
  type AddItemResult,
} from "@/lib/cart-actions";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
};

export type { AddItemResult };

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<AddItemResult>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "stp-market-cart";

export function CartProvider({
  children,
  isCustomer,
}: {
  children: ReactNode;
  isCustomer: boolean;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Sem sessão de cliente: carrinho local (localStorage). Com sessão: carrinho do
  // servidor, fazendo merge do que estava guardado localmente antes do login.
  useEffect(() => {
    let cancelled = false;
    setHydrated(false);

    async function sync() {
      if (isCustomer) {
        let localItems: { productId: string; quantity: number }[] = [];
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed: CartItem[] = JSON.parse(stored);
            localItems = parsed.map((i) => ({ productId: i.productId, quantity: i.quantity }));
          }
        } catch {
          // localStorage indisponível ou dados corrompidos — segue sem merge
        }

        const serverItems = localItems.length
          ? await mergeLocalCartIntoServer(localItems)
          : await getServerCart();

        if (cancelled) return;
        setItems(serverItems);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!cancelled) setItems(stored ? JSON.parse(stored) : []);
        } catch {
          if (!cancelled) setItems([]);
        }
      }
      if (!cancelled) setHydrated(true);
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, [isCustomer]);

  useEffect(() => {
    if (!hydrated || isCustomer) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated, isCustomer]);

  async function addItem(
    item: Omit<CartItem, "quantity">,
    quantity = 1
  ): Promise<AddItemResult> {
    if (isCustomer) {
      const { items: nextItems, result } = await addServerCartItem(item.productId, quantity);
      setItems(nextItems);
      return result;
    }

    const existing = items.find((i) => i.productId === item.productId);
    const currentQuantity = existing?.quantity ?? 0;

    if (currentQuantity >= item.stock) {
      return "maxed";
    }

    const nextQuantity = Math.min(currentQuantity + quantity, item.stock);
    const result: AddItemResult = nextQuantity < currentQuantity + quantity ? "capped" : "ok";

    setItems((current) => {
      const currentExisting = current.find((i) => i.productId === item.productId);
      if (currentExisting) {
        return current.map((i) =>
          i.productId === item.productId ? { ...i, quantity: nextQuantity } : i
        );
      }
      return [...current, { ...item, quantity: nextQuantity }];
    });

    return result;
  }

  async function removeItem(productId: string) {
    if (isCustomer) {
      setItems(await removeServerCartItem(productId));
      return;
    }
    setItems((current) => current.filter((i) => i.productId !== productId));
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (isCustomer) {
      setItems(await updateServerCartItemQuantity(productId, quantity));
      return;
    }
    setItems((current) =>
      current.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
          : i
      )
    );
  }

  async function clear() {
    if (isCustomer) {
      await clearServerCart();
    }
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}

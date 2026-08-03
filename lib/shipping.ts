export const FREE_SHIPPING_THRESHOLD = 10;
export const SHIPPING_FEE = 2.5;

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

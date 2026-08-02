const DEFAULT_COMMISSION_RATE = 10;

/** Percentagem da plataforma sobre cada venda de um vendedor, como fração (ex: 0.10 para 10%). */
export function getCommissionRate(): number {
  const raw = process.env.COMMISSION_RATE;
  const parsed = raw ? Number(raw) : NaN;
  const rate = Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : DEFAULT_COMMISSION_RATE;
  return rate / 100;
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getVendorBalance } from "@/lib/vendor-balance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WithdrawalRequestForm } from "@/components/vendor/WithdrawalRequestForm";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
};

export default async function VendorBalancePage() {
  const session = await auth();
  const vendorId = session!.user.id;

  const [balance, withdrawals] = await Promise.all([
    getVendorBalance(vendorId),
    prisma.withdrawalRequest.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Saldo</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total vendido (líquido)</CardDescription>
            <CardTitle className="text-3xl">€{balance.totalEarned.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Já levantado / pendente</CardDescription>
            <CardTitle className="text-3xl">€{balance.totalReserved.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Saldo disponível</CardDescription>
            <CardTitle className="text-3xl">€{balance.available.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitar levantamento</CardTitle>
          <CardDescription>
            O pagamento é feito por transferência bancária pela nossa equipa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WithdrawalRequestForm available={balance.available} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de levantamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Valor</TableHead>
                <TableHead>Pedido em</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>€{withdrawal.amount.toFixed(2)}</TableCell>
                  <TableCell>{withdrawal.createdAt.toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell>{STATUS_LABELS[withdrawal.status] ?? withdrawal.status}</TableCell>
                </TableRow>
              ))}
              {withdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Ainda não fizeste nenhum pedido de levantamento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

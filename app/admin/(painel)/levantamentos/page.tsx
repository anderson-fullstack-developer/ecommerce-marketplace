import { prisma } from "@/lib/prisma";
import type { WithdrawalStatus } from "@/lib/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WithdrawalActions } from "@/components/admin/WithdrawalActions";
import { WithdrawalFilters } from "@/components/admin/WithdrawalFilters";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
};

const VALID_STATUSES = Object.keys(STATUS_LABELS);

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter =
    status && VALID_STATUSES.includes(status) ? (status as WithdrawalStatus) : undefined;

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    include: { vendor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Levantamentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos de levantamento dos fornecedores. Transfere por fora e marca como pago.
        </p>
      </div>

      <WithdrawalFilters defaultValue={status ?? ""} />

      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({withdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pedido em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.vendor.name}</TableCell>
                  <TableCell>€{request.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {request.paymentMethod ? (
                      <>
                        <div className="font-medium">
                          {request.paymentMethod === "IBAN" ? "IBAN" : "MB WAY"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.paymentDetails}
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{STATUS_LABELS[request.status] ?? request.status}</TableCell>
                  <TableCell>{request.createdAt.toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell className="text-right">
                    {request.status === "PENDING" && (
                      <WithdrawalActions requestId={request.id} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {withdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Sem pedidos de levantamento.
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

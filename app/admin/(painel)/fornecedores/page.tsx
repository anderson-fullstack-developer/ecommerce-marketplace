import { prisma } from "@/lib/prisma";
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
import { VendorActions } from "@/components/admin/VendorActions";
import { WithdrawalActions } from "@/components/admin/WithdrawalActions";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

export default async function AdminVendorsPage() {
  const [vendors, pendingWithdrawals] = await Promise.all([
    prisma.vendor.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.withdrawalRequest.findMany({
      where: { status: "PENDING" },
      include: { vendor: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Fornecedores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Candidaturas de vendedores, aprovação e pedidos de levantamento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos de levantamento</CardTitle>
          <CardDescription>Transfere por fora e marca como pago.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Pedido em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingWithdrawals.map((request) => (
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
                  <TableCell>{request.createdAt.toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell className="text-right">
                    <WithdrawalActions requestId={request.id} />
                  </TableCell>
                </TableRow>
              ))}
              {pendingWithdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Sem pedidos de levantamento pendentes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>
                    <div>{vendor.email}</div>
                    <div className="text-xs text-muted-foreground">{vendor.phone}</div>
                  </TableCell>
                  <TableCell>{STATUS_LABELS[vendor.status] ?? vendor.status}</TableCell>
                  <TableCell>{vendor.createdAt.toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell className="text-right">
                    {vendor.status === "PENDING" ? (
                      <VendorActions vendorId={vendor.id} />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
              {vendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Ainda não há candidaturas.
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

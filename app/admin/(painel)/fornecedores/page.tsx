import Link from "next/link";
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
import { WithdrawalActions } from "@/components/admin/WithdrawalActions";

export default async function AdminVendorsPage() {
  const [vendors, pendingWithdrawals] = await Promise.all([
    prisma.vendor.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { products: true } } },
    }),
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
          Fornecedores já aprovados e pedidos de levantamento. Candidaturas por decidir estão
          em "Candidaturas".
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
          <CardTitle>Fornecedores ({vendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>NIF</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Fornecedor desde</TableHead>
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
                  <TableCell>{vendor.nif ?? "—"}</TableCell>
                  <TableCell>{vendor._count.products}</TableCell>
                  <TableCell>{vendor.createdAt.toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/fornecedores/${vendor.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {vendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Ainda não há fornecedores aprovados.
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

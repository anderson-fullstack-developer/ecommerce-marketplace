import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Fornecedores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fornecedores já aprovados. Candidaturas por decidir estão em "Candidaturas", pedidos
          de levantamento em "Levantamentos".
        </p>
      </div>

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

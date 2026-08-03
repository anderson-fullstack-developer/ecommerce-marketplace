import { prisma } from "@/lib/prisma";
import type { VendorStatus } from "@/lib/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VendorActions } from "@/components/admin/VendorActions";
import { CandidaturaFilters } from "@/components/admin/CandidaturaFilters";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const VALID_STATUSES = Object.keys(STATUS_LABELS);

export default async function AdminCandidaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter =
    status && VALID_STATUSES.includes(status) ? (status as VendorStatus) : undefined;

  const applications = await prisma.vendor.findMany({
    where: statusFilter ? { status: statusFilter } : { status: { not: "APPROVED" } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Candidaturas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Candidaturas de fornecedores. Por omissão mostra pendentes e rejeitadas — filtra por
          "Aprovado" para ver o histórico completo.
        </p>
      </div>

      <CandidaturaFilters defaultValue={status ?? ""} />

      <Card>
        <CardHeader>
          <CardTitle>Candidaturas ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>NIF</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>
                    <div>{vendor.email}</div>
                    <div className="text-xs text-muted-foreground">{vendor.phone}</div>
                  </TableCell>
                  <TableCell>{vendor.nif ?? "—"}</TableCell>
                  <TableCell>
                    {vendor.documentUrl ? (
                      <a
                        href={vendor.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Ver documento
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{STATUS_LABELS[vendor.status] ?? vendor.status}</TableCell>
                  <TableCell>{vendor.createdAt.toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell className="text-right">
                    {vendor.status === "PENDING" && <VendorActions vendorId={vendor.id} />}
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Sem candidaturas.
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

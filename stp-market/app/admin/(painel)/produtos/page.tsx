import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { ProductApprovalActions } from "@/components/admin/ProductApprovalActions";
import { cloudinaryResize } from "@/lib/cloudinary-url";
import { deleteProduct } from "./actions";

const APPROVAL_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const APPROVAL_STYLES: Record<string, string> = {
  PENDING: "text-amber-600",
  APPROVED: "text-emerald-600",
  REJECTED: "text-destructive",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, vendor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Button render={<Link href="/admin/produtos/novo" />} nativeButton={false}>
          Novo produto
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {/* eslint-disable-next-line @next/next/no-img-element -- imagens externas (Cloudinary/placeholder), sem domínios configurados no next/image */}
                <img
                  src={cloudinaryResize(product.imageUrl, 80)}
                  alt={product.name}
                  loading="lazy"
                  className="size-10 rounded-md border border-input object-cover"
                />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>{product.vendor?.name ?? "—"}</TableCell>
              <TableCell>€{product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.active ? "Sim" : "Não"}</TableCell>
              <TableCell className={APPROVAL_STYLES[product.approvalStatus]}>
                {APPROVAL_LABELS[product.approvalStatus]}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                {product.approvalStatus === "PENDING" && (
                  <ProductApprovalActions productId={product.id} />
                )}
                <Button
                  render={<Link href={`/admin/produtos/${product.id}/editar`} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  Editar
                </Button>
                <DeleteProductButton
                  productId={product.id}
                  productName={product.name}
                  onDelete={deleteProduct}
                />
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                Ainda não há produtos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

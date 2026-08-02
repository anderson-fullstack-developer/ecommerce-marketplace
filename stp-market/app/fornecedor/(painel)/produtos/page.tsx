import Link from "next/link";
import { auth } from "@/auth";
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
import { cloudinaryResize } from "@/lib/cloudinary-url";
import { deleteVendorProduct } from "./actions";

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

export default async function VendorProductsPage() {
  const session = await auth();
  const vendorId = session!.user.id;

  const products = await prisma.product.findMany({
    where: { vendorId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Os meus produtos</h1>
        <Button render={<Link href="/fornecedor/produtos/novo" />} nativeButton={false}>
          Novo produto
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
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
              <TableCell>€{product.price.toFixed(2)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.active ? "Sim" : "Não"}</TableCell>
              <TableCell className={APPROVAL_STYLES[product.approvalStatus]}>
                {APPROVAL_LABELS[product.approvalStatus]}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  render={<Link href={`/fornecedor/produtos/${product.id}/editar`} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  Editar
                </Button>
                <DeleteProductButton
                  productId={product.id}
                  productName={product.name}
                  onDelete={deleteVendorProduct}
                />
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Ainda não publicaste produtos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

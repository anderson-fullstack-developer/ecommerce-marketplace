import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function VendorIndexPage() {
  const session = await auth();
  const isVendor = session?.user?.role === "VENDOR";
  redirect(isVendor ? "/fornecedor/painel" : "/fornecedor/login");
}

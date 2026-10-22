import { UserProfile } from "@clerk/nextjs";
import { Package } from "lucide-react";
import { CustomerSignOutButton } from "@/components/CustomerSignOutButton";

export default function ContaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold">Definições</h1>
        <CustomerSignOutButton />
      </div>

      <div className="mt-6 flex justify-center">
        <UserProfile routing="hash">
          <UserProfile.Link
            label="As minhas encomendas"
            labelIcon={<Package className="size-4" />}
            url="/conta/encomendas"
          />
        </UserProfile>
      </div>
    </div>
  );
}

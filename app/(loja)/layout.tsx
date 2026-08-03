import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatAssistant } from "@/components/ChatAssistant";
import { WelcomeModal } from "@/components/WelcomeModal";
import { CartProvider } from "@/hooks/use-cart";

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isCustomer = session?.user?.role === "CUSTOMER";

  return (
    <CartProvider isCustomer={isCustomer}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatAssistant />
      <WelcomeModal />
    </CartProvider>
  );
}

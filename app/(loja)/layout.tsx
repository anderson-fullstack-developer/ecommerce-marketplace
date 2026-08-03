import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatAssistant } from "@/components/ChatAssistant";
import { WelcomeModal } from "@/components/WelcomeModal";
import { CartProvider } from "@/hooks/use-cart";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatAssistant />
      <WelcomeModal />
    </CartProvider>
  );
}

import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ptPT } from "@clerk/localizations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatAssistant } from "@/components/ChatAssistant";
import { WelcomeModal } from "@/components/WelcomeModal";
import { CartProvider } from "@/hooks/use-cart";

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const isCustomer = !!userId;

  return (
    <ClerkProvider
      localization={ptPT}
      signInUrl="/conta/login"
      signUpUrl="/conta/registar"
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "oklch(0.55 0.16 45)",
          borderRadius: "0.625rem",
          fontFamily: "var(--font-sans)",
        },
      }}
    >
      <CartProvider isCustomer={isCustomer}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatAssistant />
        <WelcomeModal />
      </CartProvider>
    </ClerkProvider>
  );
}

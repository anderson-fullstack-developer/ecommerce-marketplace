import { SignIn } from "@clerk/nextjs";

export default function CustomerLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignIn
        path="/conta/login"
        signUpUrl="/conta/registar"
        fallbackRedirectUrl="/conta/encomendas"
      />
    </div>
  );
}

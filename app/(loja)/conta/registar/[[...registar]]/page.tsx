import { SignUp } from "@clerk/nextjs";

export default function CustomerRegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SignUp path="/conta/registar" signInUrl="/conta/login" fallbackRedirectUrl="/?bemvindo=1" />
    </div>
  );
}

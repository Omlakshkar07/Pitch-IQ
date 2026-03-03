import { SignInPage } from "@/components/ui/signin-page";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignInPage />
    </Suspense>
  );
}

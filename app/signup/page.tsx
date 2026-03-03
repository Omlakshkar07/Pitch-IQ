import { SignInPage } from "@/components/ui/signin-page";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignInPage isSignUp={true} />
    </Suspense>
  );
}

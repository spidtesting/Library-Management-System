import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/features/auth/AuthCard";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in | Library",
};

export default function LoginPage() {
  return (
    <AuthCard title="Sign in" description="Access your library account">
      <Suspense
        fallback={
          <div className="w-full max-w-md space-y-4 rounded-xl border p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}

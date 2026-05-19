import type { Metadata } from "next";
import { AuthCard } from "@/components/features/auth/AuthCard";
import { RegisterForm } from "@/components/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register | Library",
};

export default function RegisterPage() {
  return (
    <AuthCard title="Create account" description="Join as a library member">
      <RegisterForm />
    </AuthCard>
  );
}

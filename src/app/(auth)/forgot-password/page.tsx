import type { Metadata } from "next";
import { AuthCard } from "@/components/features/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password | Library",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      description="We will email you a reset link"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

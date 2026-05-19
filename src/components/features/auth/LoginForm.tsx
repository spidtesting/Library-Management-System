"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { signIn, getProfile, getDashboardPath } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true },
  });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    setError(null);
    try {
      await signIn(values);
      const profile = await getProfile();
      const redirect = searchParams.get("redirect");
      const rolePath = profile
        ? getDashboardPath(profile.role)
        : "/member/dashboard";
      if (
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//") &&
        !redirect.startsWith("/login")
      ) {
        router.push(redirect);
      } else {
        router.push(rolePath);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="identifier">Email or NIC number</Label>
        <Input
          id="identifier"
          type="text"
          autoComplete="username"
          placeholder="you@example.com or 951234567V"
          {...register("identifier")}
        />
        {errors.identifier?.message && (
          <p className="text-sm text-destructive">{errors.identifier.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password?.message && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="rememberMe"
          checked={watch("rememberMe")}
          onCheckedChange={(v) => setValue("rememberMe", v === true)}
          aria-label="Remember me"
        />
        <Label htmlFor="rememberMe" className="font-normal cursor-pointer">
          Remember me
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-brand hover:underline">
          Forgot password?
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Library accounts are created by staff. Contact the library if you need access.
      </p>
    </form>
  );
}

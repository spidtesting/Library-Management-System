"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSelfUpdateSchema,
  type ProfileSelfUpdateInput,
} from "@/lib/validations";
import type { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { parseApiResponse } from "@/lib/parse-api-response";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const isMember = profile.role === "member";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSelfUpdateSchema),
    defaultValues: {
      full_name: profile.full_name,
      nic_number: profile.nic_number ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
    },
  });

  async function onSubmit(values: ProfileSelfUpdateInput) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update profile");
      return;
    }
    toast.success("Profile updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile.email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name?.message && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>
      {isMember && (
        <div className="space-y-2">
          <Label htmlFor="nic_number">NIC number</Label>
          <Input
            id="nic_number"
            placeholder="e.g. 123456789V"
            className="font-mono"
            {...register("nic_number")}
          />
          <p className="text-xs text-muted-foreground">
            {profile.nic_number
              ? "You can update your NIC here. It is also used to sign in."
              : "Add your NIC to sign in with NIC instead of email."}
          </p>
          {errors.nic_number?.message && (
            <p className="text-sm text-destructive">{errors.nic_number.message}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" {...register("phone")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileOverview } from "./ProfileOverview";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import type { Profile } from "@/types";
import { SectionCard } from "@/components/ui/section-card";

export function ProfilePageContent({ profile }: { profile: Profile }) {
  const isMember = profile.role === "member";

  return (
    <div>
      <PageHeader
        title="My profile"
        description="View and update your account details"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileOverview profile={profile} />
        <div className="space-y-6">
          <SectionCard title="Edit details" accent="blue">
            <ProfileForm profile={profile} />
          </SectionCard>
          {isMember && (
            <SectionCard title="Change password" accent="amber">
              <ChangePasswordForm />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

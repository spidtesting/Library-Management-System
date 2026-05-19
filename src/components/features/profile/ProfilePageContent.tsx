import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileOverview } from "./ProfileOverview";
import { ProfileForm } from "./ProfileForm";
import type { Profile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfilePageContent({ profile }: { profile: Profile }) {
  return (
    <div>
      <PageHeader
        title="My profile"
        description="View and update your account details"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileOverview profile={profile} />
        <Card>
          <CardHeader>
            <CardTitle>Edit details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

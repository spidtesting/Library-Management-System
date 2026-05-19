import type { Profile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "./UserAvatar";
import { formatDate } from "@/utils/formatDate";
import { Mail, Phone, MapPin, Calendar, CreditCard, type LucideIcon } from "lucide-react";

export function ProfileOverview({ profile }: { profile: Profile }) {
  const isMember = profile.role === "member";
  const tokenPercent =
    profile.borrow_token_limit > 0
      ? (profile.borrow_tokens_used / profile.borrow_token_limit) * 100
      : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        <UserAvatar name={profile.full_name} avatarUrl={profile.avatar_url} size="lg" />
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-xl">{profile.full_name}</CardTitle>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="capitalize">
              {profile.role}
            </Badge>
            {isMember && (
              <Badge variant={profile.is_active ? "default" : "destructive"}>
                {profile.is_active ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <ProfileDetail icon={Mail} label="Email" value={profile.email} />
        {isMember && profile.nic_number && (
          <ProfileDetail
            icon={CreditCard}
            label="NIC number"
            value={profile.nic_number}
          />
        )}
        {isMember && profile.nic_number && (
          <ProfileDetail
            icon={CreditCard}
            label="NIC number"
            value={profile.nic_number}
          />
        )}
        <ProfileDetail
          icon={Phone}
          label="Phone"
          value={profile.phone ?? "Not set"}
        />
        <ProfileDetail
          icon={MapPin}
          label="Address"
          value={profile.address ?? "Not set"}
        />
        <ProfileDetail
          icon={Calendar}
          label="Member since"
          value={formatDate(profile.created_at)}
        />
        {isMember && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Borrow tokens</p>
            <Progress value={tokenPercent} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {profile.borrow_tokens_used} of {profile.borrow_token_limit} used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProfileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="break-words">{value}</p>
      </div>
    </div>
  );
}

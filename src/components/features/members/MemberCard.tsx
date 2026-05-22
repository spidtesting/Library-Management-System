import type { Profile } from "@/types";
import { SectionCard } from "@/components/ui/section-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { borrowAccessBadgeClass, formatRoleLabel, roleBadgeClass } from "@/lib/status-badges";
import { cn } from "@/lib/utils";

export function MemberCard({
  member,
  pendingFines = 0,
}: {
  member: Profile;
  pendingFines?: number;
}) {
  const isLibraryMember = member.role === "member";
  const used = member.borrow_tokens_used;
  const limit = member.borrow_token_limit;
  const percent = limit > 0 ? (used / limit) * 100 : 0;

  return (
    <SectionCard title={member.full_name} description={member.email} accent="violet">
      <div className="space-y-3">
        <Badge variant="outline" className={cn("w-full justify-center py-1", roleBadgeClass(member.role))}>
          {formatRoleLabel(member.role)}
        </Badge>
        {isLibraryMember ? (
          <>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/[0.04] p-3">
              <p className="text-xs font-medium text-muted-foreground">Borrow tokens</p>
              <Progress value={percent} className="mt-1" aria-label="Borrow tokens used" />
              <p className="text-xs text-muted-foreground mt-1">
                {used} / {limit} tokens used
              </p>
            </div>
            {pendingFines > 0 && (
              <Badge variant="destructive" className="w-full justify-center py-1">
                Pending fines: ${pendingFines.toFixed(2)}
              </Badge>
            )}
            <Badge
              variant={member.is_active ? "default" : "destructive"}
              className={cn("w-full justify-center py-1", borrowAccessBadgeClass(member.is_active))}
            >
              {member.is_active ? "Can borrow books" : "Borrow blocked"}
            </Badge>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Staff account — uses the {member.role} portal, not member borrowing.
          </p>
        )}
      </div>
    </SectionCard>
  );
}

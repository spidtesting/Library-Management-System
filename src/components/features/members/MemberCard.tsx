import type { Profile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function MemberCard({
  member,
  pendingFines = 0,
}: {
  member: Profile;
  pendingFines?: number;
}) {
  const used = member.borrow_tokens_used;
  const limit = member.borrow_token_limit;
  const percent = limit > 0 ? (used / limit) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{member.full_name}</CardTitle>
        <p className="text-sm text-muted-foreground">{member.email}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Borrow tokens</p>
          <Progress value={percent} className="mt-1" aria-label="Borrow tokens used" />
          <p className="text-xs text-muted-foreground mt-1">
            {used} / {limit} tokens used
          </p>
        </div>
        {pendingFines > 0 && (
          <Badge variant="destructive">Pending fines: ${pendingFines.toFixed(2)}</Badge>
        )}
        <Badge variant={member.is_active ? "default" : "destructive"}>
          {member.is_active ? "Can borrow books" : "Borrow blocked"}
        </Badge>
      </CardContent>
    </Card>
  );
}

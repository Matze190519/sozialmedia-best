import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Users, Shield, User, Crown } from "lucide-react";

export default function TeamPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: teamMembers, isLoading } = trpc.team.list.useQuery();

  const updateRoleMut = trpc.team.updateRole.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      toast.success("Rolle aktualisiert!");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-400" />
          Team-Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Team-Mitglieder verwalten und Rollen zuweisen
        </p>
      </div>

      {/* Role Legend */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-muted-foreground"><strong>Admin</strong> - Kann alles genehmigen, Content publizieren, Team verwalten</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-blue-400" />
          <span className="text-muted-foreground"><strong>User</strong> - Kann Content erstellen und zur Review einreichen</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : teamMembers && teamMembers.length > 0 ? (
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <Card key={member.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${member.role === "admin" ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
                      {member.role === "admin" ? (
                        <Crown className="h-6 w-6 text-amber-400" />
                      ) : (
                        <User className="h-6 w-6 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.name || "Unbenannt"}</p>
                      <p className="text-sm text-muted-foreground">{member.email || "Keine E-Mail"}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={member.role === "admin" ? "default" : "outline"}>
                          {member.role === "admin" ? "Admin" : "Team-Mitglied"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Letzter Login: {new Date(member.lastSignedIn).toLocaleDateString("de-DE")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isAdmin && member.id !== user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRoleMut.mutate({
                        userId: member.id,
                        role: member.role === "admin" ? "user" : "admin",
                      })}
                      disabled={updateRoleMut.isPending}
                      className="gap-1.5"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      {member.role === "admin" ? "Zu User" : "Zu Admin"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Team-Mitglieder.</p>
            <p className="text-sm text-muted-foreground mt-2">Teile den Login-Link mit deinem Team.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

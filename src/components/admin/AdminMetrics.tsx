import { Users, UserCog, Mail, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Invitation } from "@/lib/api/admin";

interface AdminMetricsProps {
  users: User[];
  invitations: Invitation[];
}

export default function AdminMetrics({ users, invitations }: AdminMetricsProps) {
  // Calculer les métriques
  const activeUsers = users.filter(u => u.status === "active").length;
  const inactiveUsers = users.filter(u => u.status === "inactive").length;
  const pendingInvitations = invitations.filter(i => !i.is_accepted).length;
  const totalUsers = users.length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Utilisateurs actifs
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {activeUsers}
                </span>
              </div>
            </div>
            <div className="p-3 bg-benaya-100 dark:bg-benaya-900/30 rounded-xl">
              <Users className="w-6 h-6 text-benaya-900 dark:text-benaya-200" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Utilisateurs inactifs
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {inactiveUsers}
                </span>
              </div>
            </div>
            <div className="p-3 bg-benaya-100 dark:bg-benaya-900/30 rounded-xl">
              <UserCog className="w-6 h-6 text-benaya-900 dark:text-benaya-200" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Invitations en attente
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {pendingInvitations}
                </span>
              </div>
            </div>
            <div className="p-3 bg-benaya-100 dark:bg-benaya-900/30 rounded-xl">
              <Mail className="w-6 h-6 text-benaya-900 dark:text-benaya-200" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total utilisateurs
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {totalUsers}
                </span>
              </div>
            </div>
            <div className="p-3 bg-benaya-100 dark:bg-benaya-900/30 rounded-xl">
              <Shield className="w-6 h-6 text-benaya-900 dark:text-benaya-200" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
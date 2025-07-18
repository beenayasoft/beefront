import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/lib/api/admin";

interface RoleBadgesProps {
  roles: Role[];
}

export function RoleBadges({ roles }: RoleBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => {
        let badgeClass = "";
        
        switch(role.name) {
          case "Administrateur":
            badgeClass = "bg-benaya-900 hover:bg-benaya-800";
            break;
          case "Gérant":
            badgeClass = "bg-benaya-700 hover:bg-benaya-600";
            break;
          case "Administratif/Bureau":
            badgeClass = "bg-benaya-500 hover:bg-benaya-400";
            break;
          case "Opérationnel/Travaux":
            badgeClass = "bg-benaya-300 text-benaya-900 hover:bg-benaya-200";
            break;
          default:
            badgeClass = "bg-gray-500 hover:bg-gray-400";
        }
        
        return (
          <Badge key={role.id} className={badgeClass}>
            <Shield className="w-3 h-3 mr-1" />
            {role.name}
          </Badge>
        );
      })}
    </div>
  );
}

export default RoleBadges; 
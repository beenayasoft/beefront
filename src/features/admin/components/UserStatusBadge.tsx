import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: string;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  if (status === "active") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Actif
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inactif
      </Badge>
    );
  }
}

export default UserStatusBadge; 
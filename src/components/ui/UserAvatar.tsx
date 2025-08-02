import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  /** Utilisateur spécifique (optionnel, utilise l'utilisateur connecté par défaut) */
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    avatar?: string;
  };
  /** Taille de l'avatar */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Classes CSS personnalisées */
  className?: string;
  /** Afficher l'icône User si pas d'avatar et pas d'initiales */
  showUserIcon?: boolean;
  /** Couleur de fond personnalisée pour les initiales */
  fallbackClassName?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

export function UserAvatar({ 
  user: propUser, 
  size = "md", 
  className, 
  showUserIcon = true,
  fallbackClassName 
}: UserAvatarProps) {
  const { user: authUser } = useAuth();
  
  // Utiliser l'utilisateur passé en prop ou l'utilisateur connecté
  const user = propUser || authUser;
  
  // Obtenir les initiales de l'utilisateur
  const getInitials = () => {
    if (!user) return "";
    
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return "";
  };

  const initials = getInitials();

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user?.avatar && (
        <AvatarImage 
          src={user.avatar} 
          alt={user.username || user.email || "Avatar"} 
        />
      )}
      <AvatarFallback 
        className={cn(
          "bg-Beenaya-100 dark:bg-Beenaya-900 text-Beenaya-700 dark:text-Beenaya-300",
          "font-semibold flex items-center justify-center",
          fallbackClassName
        )}
      >
        {initials ? (
          initials
        ) : showUserIcon ? (
          <User className={cn(
            size === "xs" && "h-3 w-3",
            size === "sm" && "h-4 w-4", 
            size === "md" && "h-5 w-5",
            size === "lg" && "h-6 w-6",
            size === "xl" && "h-8 w-8"
          )} />
        ) : (
          "?"
        )}
      </AvatarFallback>
    </Avatar>
  );
}

// Composant wrapper pour remplacer facilement les icônes User existantes
interface UserIconProps {
  /** Taille de l'icône */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Classes CSS personnalisées */
  className?: string;
  /** Utilisateur spécifique (optionnel) */
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    avatar?: string;
  };
}

export function UserIcon({ size = "md", className, user }: UserIconProps) {
  return (
    <UserAvatar 
      user={user}
      size={size} 
      className={className}
      showUserIcon={true}
    />
  );
}
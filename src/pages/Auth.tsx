import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthForm } from "@/hooks/useAuthForm";

export default function Auth() {
  const {
    mode,
    setMode,
    formData,
    handleInputChange,
    isSubmitting,
    showPassword,
    toggleShowPassword,
    formError,
    submit,
    backendError: error,
  } = useAuthForm("login");

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 benaya-gradient relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 text-white">
                <img src="/logo.svg" alt="Beenaya logo" className="w-full h-full" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Beenaya</h1>
              <p className="text-lg opacity-90">ERP Construction</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Gérez vos chantiers en toute simplicité
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              La solution complète pour la gestion de vos projets de
              construction. Devis, planning, facturation, tout en un.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-lg">Gestion complète des devis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-lg">
                  Suivi des chantiers en temps réel
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-lg">Facturation automatisée</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <img src="/logo.svg" alt="Beenaya logo" className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-benaya-900">Beenaya</h1>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {mode === "login" ? "Connexion" : "Créer un compte"}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {mode === "login"
                ? "Connectez-vous à votre espace Benaya"
                : "Rejoignez des milliers d'entrepreneurs"}
            </p>
          </div>

          {/* Afficher les erreurs */}
          {(formError || error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formError || error}
              </AlertDescription>
            </Alert>
          )}

          {/* Auth Form */}
          <form onSubmit={submit} className="space-y-6">
            {/* Name Fields (Signup only) */}
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-neutral-900 dark:text-white"
                  >
                    Prénom
                  </Label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="Jean"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                    className="benaya-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="last_name"
                    className="text-neutral-900 dark:text-white"
                  >
                    Nom
                  </Label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Dupont"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                    className="benaya-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Company Field (Signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-neutral-900 dark:text-white"
                >
                  Entreprise
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Mon entreprise de construction"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className="pl-10 benaya-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-neutral-900 dark:text-white"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@entreprise.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 benaya-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-neutral-900 dark:text-white"
              >
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10 benaya-input"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-neutral-400 hover:text-neutral-600"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password Field (Signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="password2"
                  className="text-neutral-900 dark:text-white"
                >
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="password2"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password2}
                    onChange={(e) =>
                      handleInputChange("password2", e.target.value)
                    }
                    className="pl-10 pr-10 benaya-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Terms (Signup only) */}
            {mode === "signup" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("acceptTerms", checked as boolean)
                  }
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  J'accepte les{" "}
                  <a href="#" className="text-benaya-900 hover:underline">
                    conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="#" className="text-benaya-900 hover:underline">
                    politique de confidentialité
                  </a>
                </Label>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full benaya-button-primary text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : mode === "login" ? (
                "Se connecter"
              ) : (
                "Créer mon compte"
              )}
            </Button>

            {/* Toggle Mode */}
            <div className="text-center">
              <p className="text-neutral-600 dark:text-neutral-400">
                {mode === "login"
                  ? "Vous n'avez pas de compte ?"
                  : "Vous avez déjà un compte ?"}
                <Button
                  type="button"
                  variant="link"
                  className="text-benaya-900 hover:underline p-1 ml-1"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                  }}
                >
                  {mode === "login" ? "Créer un compte" : "Se connecter"}
                </Button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

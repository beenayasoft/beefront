import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { TenantInfo } from "../types/tenant";

interface CompanyIdentityFormProps {
  companyData: TenantInfo;
  onChange: (data: Partial<TenantInfo>) => void;
}

export function CompanyIdentityForm({ companyData, onChange }: CompanyIdentityFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(
    companyData.settings?.logo_base64 || null
  );

  const handleNameChange = (value: string) => {
    onChange({ name: value });
  };

  const handleAddressChange = (field: string, value: string) => {
    onChange({
      address: {
        ...companyData.address,
        [field]: value
      }
    });
  };

  const handleContactChange = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      onChange({ 
        settings: {
          ...companyData.settings,
          logo_base64: result
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    onChange({ 
      settings: {
        ...companyData.settings,
        logo_base64: null
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyName">Nom de la société <span className="text-red-500">*</span></Label>
          <Input
            id="companyName"
            value={companyData.name || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Nom de votre entreprise"
            className="benaya-input"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2 md:col-span-2">
          <Label>Logo de l'entreprise</Label>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4 text-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="logo"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.svg"
                  onChange={handleLogoChange}
                />
                <label htmlFor="logo" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Cliquez pour télécharger votre logo
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    JPG, PNG ou SVG. Max 2MB.
                  </p>
                </label>
              </div>
            </div>

            {logoPreview && (
              <div className="relative">
                <div className="w-24 h-24 border border-neutral-200 dark:border-neutral-700 rounded-lg flex items-center justify-center bg-white dark:bg-neutral-800 overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  onClick={removeLogo}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adresse</Label>
          <Textarea
            id="address"
            value={companyData.address?.line1 || ""}
            onChange={(e) => handleAddressChange("line1", e.target.value)}
            placeholder="Adresse ligne 1"
            className="benaya-input min-h-[40px]"
          />
          <Textarea
            id="address2"
            value={companyData.address?.line2 || ""}
            onChange={(e) => handleAddressChange("line2", e.target.value)}
            placeholder="Adresse ligne 2 (optionnel)"
            className="benaya-input min-h-[40px] mt-2"
          />
        </div>

        {/* Postal Code, City, Country */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">Code postal</Label>
          <Input
            id="postalCode"
            value={companyData.address?.postal_code || ""}
            onChange={(e) => handleAddressChange("postal_code", e.target.value)}
            placeholder="Code postal"
            className="benaya-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={companyData.address?.city || ""}
            onChange={(e) => handleAddressChange("city", e.target.value)}
            placeholder="Ville"
            className="benaya-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            value={companyData.address?.country || ""}
            onChange={(e) => handleAddressChange("country", e.target.value)}
            placeholder="Pays"
            className="benaya-input"
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={companyData.phone || ""}
            onChange={(e) => handleContactChange("phone", e.target.value)}
            placeholder="Téléphone"
            className="benaya-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={companyData.email || ""}
            onChange={(e) => handleContactChange("email", e.target.value)}
            placeholder="Email"
            className="benaya-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            type="url"
            value={companyData.website || ""}
            onChange={(e) => handleContactChange("website", e.target.value)}
            placeholder="Site web"
            className="benaya-input"
          />
        </div>
      </div>
    </div>
  );
}
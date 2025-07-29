import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TenantInfo } from "../types/tenant";

interface LegalFinancialFormProps {
  tenantData: TenantInfo;
  onChange: (data: Partial<TenantInfo>) => void;
}

export function LegalFinancialForm({ tenantData, onChange }: LegalFinancialFormProps) {
  const handleLegalChange = (field: string, value: string) => {
    onChange({
      legal: {
        ...tenantData.legal,
        [field]: value
      }
    });
  };
  
  const handleBankChange = (field: string, value: string) => {
    onChange({
      bank_info: {
        ...tenantData.bank_info,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Legal Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Informations légales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="legalForm">Forme juridique</Label>
            <Select 
              value={tenantData.legal?.legal_form || ""} 
              onValueChange={(value) => handleLegalChange("legal_form", value)}
            >
              <SelectTrigger className="benaya-input">
                <SelectValue placeholder="Sélectionner une forme juridique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SARL">SARL</SelectItem>
                <SelectItem value="EURL">EURL</SelectItem>
                <SelectItem value="SAS">SAS</SelectItem>
                <SelectItem value="SASU">SASU</SelectItem>
                <SelectItem value="SA">SA</SelectItem>
                <SelectItem value="EI">Entreprise Individuelle</SelectItem>
                <SelectItem value="EIRL">EIRL</SelectItem>
                <SelectItem value="SNC">SNC</SelectItem>
                <SelectItem value="SCI">SCI</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input
              id="siret"
              value={tenantData.legal?.siret || ""}
              onChange={(e) => handleLegalChange("siret", e.target.value)}
              placeholder="12345678901234"
              className="benaya-input"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ice">ICE (Identifiant Commun de l'Entreprise)</Label>
            <Input
              id="ice"
              value={tenantData.legal?.ice || ""}
              onChange={(e) => handleLegalChange("ice", e.target.value)}
              placeholder="000123456000789"
              className="benaya-input"
            />
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Coordonnées bancaires
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              value={tenantData.bank_info?.iban || ""}
              onChange={(e) => handleBankChange("iban", e.target.value)}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              className="benaya-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bic">BIC / SWIFT</Label>
            <Input
              id="bic"
              value={tenantData.bank_info?.bic || ""}
              onChange={(e) => handleBankChange("bic", e.target.value)}
              placeholder="ABCDEFGHIJK"
              className="benaya-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bankName">Nom de la banque</Label>
            <Input
              id="bankName"
              value={tenantData.bank_info?.bank_name || ""}
              onChange={(e) => handleBankChange("bank_name", e.target.value)}
              placeholder="Nom de votre banque"
              className="benaya-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
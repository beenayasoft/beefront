# Settings Feature

This feature manages all application settings for the Beenaya application.

## Structure

```
settings/
├── api/
│   ├── settings.ts          # Main unified settings API
│   └── index.ts            # API exports
├── components/
│   ├── CompanyIdentityForm.tsx         # Company information form
│   ├── DocumentAppearanceForm.tsx      # Document appearance settings
│   ├── LegalFinancialForm.tsx          # Legal and financial information
│   ├── NumberingFormatForm.tsx         # Document numbering configuration
│   ├── NumberingFormatFormAdvanced.tsx # Advanced numbering options
│   ├── PaymentTermsManagement.tsx      # Payment terms management
│   ├── ServiceConnectionTest.tsx       # Service connection testing
│   ├── VatRatesManagement.tsx          # VAT rates management
│   └── index.ts                       # Component exports
├── hooks/
│   ├── useDocumentAppearance.ts       # Document appearance hook
│   ├── useNumberingFormat.ts          # Numbering format hook
│   ├── useSettings.ts                 # Main settings hook
│   └── index.ts                       # Hooks exports
├── pages/
│   ├── Settings.tsx                   # Main settings page
│   └── index.ts                       # Pages exports
├── types/
│   ├── tenant.ts                      # Tenant-related types
│   └── index.ts                       # Types exports
├── utils/
│   ├── tenantTransformers.ts          # Data transformation utilities
│   └── index.ts                       # Utils exports
├── index.ts                           # Main feature exports
└── README.md                          # This file
```

## Usage

### Import the main settings page:
```typescript
import { Settings } from '@/features/settings';
```

### Use settings hooks:
```typescript
import { useSettings, useDocumentAppearance } from '@/features/settings';

const { tenantData, updateTenantData, saveTenantData } = useSettings();
const { settings, updateSettings } = useDocumentAppearance();
```

### Import specific components:
```typescript
import { 
  CompanyIdentityForm, 
  VatRatesManagement,
  PaymentTermsManagement 
} from '@/features/settings';
```

## Key Features

1. **Company Settings**: Manage company identity, contact information, and branding
2. **Financial Settings**: Configure VAT rates, payment terms, and banking information
3. **Document Settings**: Customize document appearance and numbering formats
4. **Payment Methods**: Manage payment methods (integrated with payment-methods feature)

## APIs Used

- Internal: `/tenants/current_tenant_info/` - Main tenant information
- Internal: `/document_appearance/` - Document appearance settings
- External APIs: Managed through `@/lib/api/documentAppearance` and `@/lib/api/tenant`

## Dependencies

- React Hook Form for form management
- Zod for validation
- TailwindCSS for styling
- UI components from `@/components/ui/`
- Payment methods feature for payment configuration
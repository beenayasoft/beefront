# 🚨 PLAN MIGRATION URGENTE - RÉSOLUTION 4 MINUTES CHARGEMENT

## 🔥 **PROBLÈME CRITIQUE IDENTIFIÉ**

**Cause racine** : 80-90% de duplication entre `src/` (old) et `src/features/` (new)
- Bundle size explosé par code dupliqué
- Conflits d'imports entre anciennes/nouvelles structures
- Circular dependencies potentielles
- Résolution de modules lente

## 📊 **IMPACT PERFORMANCE**

```
Bundle actuel estimé : ~15-20MB (avec duplication)
Bundle optimisé attendu : ~3-5MB
Réduction temps chargement : 4min → 30-60s
```

## 🎯 **STRATÉGIE MIGRATION IMMÉDIATE**

### **Phase 1 : Migration App.tsx (15min)**
1. ✅ Migrer `useAuth` vers `@/features/auth/hooks/useAuth`
2. ✅ Migrer toutes les pages vers `@/features/*/pages/*`
3. ✅ Vérifier que toutes les routes fonctionnent

### **Phase 2 : Suppression en masse (10min)**
1. ✅ Supprimer TOUTES les pages obsolètes dans `src/pages/`
2. ✅ Supprimer TOUS les composants obsolètes dans `src/components/`  
3. ✅ Supprimer TOUTES les APIs obsolètes dans `src/lib/api/`
4. ✅ Supprimer TOUS les hooks obsolètes dans `src/hooks/`

### **Phase 3 : Configuration build (5min)**
1. ✅ Optimiser imports dans `tsconfig.json`
2. ✅ Vérifier build sans erreurs
3. ✅ Tester temps chargement

## 📋 **FICHIERS À MIGRER D'URGENCE**

### **App.tsx - Imports critiques**
```typescript
// ❌ ANCIEN - CHANGER IMMÉDIATEMENT
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "@/pages/Auth";

// ✅ NOUVEAU  
import { AuthProvider, useAuth } from "@/features/auth/hooks/useAuth";
import Auth from "@/features/auth/pages/Auth";
```

### **Pages à migrer dans App.tsx**
- `@/pages/Administration` → `@/features/admin/pages/Administration`
- `@/pages/Devis` → `@/features/documents/pages/Devis`
- `@/pages/DevisNew` → `@/features/documents/pages/DevisNew`
- `@/pages/Factures` → `@/features/documents/pages/Factures`
- `@/pages/Tiers` → `@/features/crm/pages/Tiers`
- `@/pages/TierDetail` → `@/features/crm/pages/TierDetail`
- `@/pages/Opportunities` → `@/features/crm/pages/Opportunities`

## 🚀 **ACTIONS IMMÉDIATES**

1. **Sauvegarder** : Git commit actuel
2. **Migrer** : App.tsx vers features/
3. **Supprimer** : Masse de doublons  
4. **Tester** : Temps de chargement
5. **Valider** : Fonctionnalités OK

## ⚡ **GAINS ATTENDUS**

- ⏱️ **Temps chargement** : 4min → 30-60s (-85%)
- 📦 **Bundle size** : -70% réduction
- 🧹 **Code complexity** : -80% duplication
- 🚀 **DX** : Architecture claire

---

**PRIORITÉ ABSOLUE** : Migration App.tsx + suppression doublons = Résolution immédiate !

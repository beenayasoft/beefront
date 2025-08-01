# 🧹 PLAN DE NETTOYAGE FRONTEND - FICHIERS OBSOLÈTES

## 📋 ANALYSE DES DOUBLONS

### ✅ **FICHIERS À SUPPRIMER** (Logique implémentée dans `features/`)

#### 1. **Pages obsolètes** (src/pages/)
- ❌ `src/pages/MaterialDetail.tsx` → ✅ `src/features/library/pages/MaterialDetail.tsx`
- ❌ `src/pages/LaborDetail.tsx` → ✅ `src/features/library/pages/LaborDetail.tsx`  
- ❌ `src/pages/WorkDetail.tsx` → ✅ `src/features/library/pages/WorkDetail.tsx`
- ❌ `src/pages/WorkLibrary.tsx` → ✅ `src/features/library/pages/WorkLibrary.tsx`

#### 2. **APIs obsolètes** (src/lib/api/)
- ❌ `src/lib/api/library.ts` → ✅ `src/features/library/api/library.ts`
- ❌ `src/lib/api/auth.ts` → ✅ `src/features/auth/api/auth.ts`
- ❌ `src/lib/api/crm.ts` → ✅ `src/features/crm/api/crm.ts`
- ❌ `src/lib/api/opportunities.ts` → ✅ `src/features/crm/api/opportunities.ts`
- ❌ `src/lib/api/tiers.ts` → ✅ `src/features/crm/api/tiers.ts`
- ❌ `src/lib/api/quotes.ts` → ✅ `src/features/documents/api/quotes.ts`
- ❌ `src/lib/api/invoices.ts` → ✅ `src/features/documents/api/invoices.ts`

#### 3. **Hooks/Services obsolètes**
- ❌ `src/hooks/useLibraryOptimized.ts` → ✅ `src/features/library/hooks/useLibraryData.ts`
- ❌ `src/lib/services/libraryService.ts` → ✅ Intégré dans `src/features/library/api/`

#### 4. **Composants obsolètes** 
- ❌ `src/components/quotes/editor/LibraryModal.tsx` → ✅ `src/features/library/components/LibraryModal.tsx`

### ⚠️ **FICHIERS À MIGRER AVANT SUPPRESSION**

Ces fichiers utilisent encore l'ancienne API et doivent être migrés :

1. **Pages principales** qui importent `@/lib/api/library`:
   - `src/pages/MaterialDetail.tsx`
   - `src/pages/LaborDetail.tsx`
   - `src/components/quotes/editor/LibraryModal.tsx`
   - `src/lib/services/libraryService.ts`
   - `src/hooks/useLibraryOptimized.ts`

### 🎯 **PLAN D'EXÉCUTION**

#### Phase 1: Migration des imports
1. ✅ Créer API composite optimisée
2. ✅ Mettre à jour `useLibraryData` pour endpoint composite  
3. ⏳ Migrer les fichiers qui utilisent encore l'ancienne API
4. ⏳ Vérifier que tout fonctionne avec la nouvelle architecture

#### Phase 2: Suppression sécurisée
1. ⏳ Supprimer les fichiers obsolètes identifiés
2. ⏳ Nettoyer les imports orphelins
3. ⏳ Mettre à jour les routes qui pointent vers les anciennes pages

### 📈 **OPTIMISATIONS DÉJÀ IMPLÉMENTÉES**

- ✅ Endpoint composite `/api/library/composite/all_items/` (-200ms)
- ✅ Architecture modulaire `features/library/`
- ✅ Hooks optimisés avec cache et fallback
- ✅ API componentisée (materials, labor, works, etc.)

### 🔄 **PROCHAINES ÉTAPES**

1. Migrer les derniers fichiers vers `features/library/`
2. Supprimer les fichiers obsolètes  
3. Valider que l'endpoint composite fonctionne
4. Documenter l'architecture finale

---

**Status**: 🔄 En cours - Architecture features/ complète, reste nettoyage legacy

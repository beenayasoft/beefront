# Guide d'intégration du nouveau service de devis

Ce guide explique comment intégrer le nouveau service de devis dans l'application Beenaya et résoudre l'erreur 401 Unauthorized.

## Problème résolu

Le problème principal était une erreur 401 Unauthorized lors des appels API vers l'endpoint `/quotes/`. Cette erreur était due à plusieurs facteurs :

1. Gestion incorrecte des en-têtes d'authentification et de tenant
2. Incohérence entre le format des données frontend et backend
3. Problèmes potentiels de casse dans les en-têtes HTTP

## Solution implémentée

Nous avons reconstruit le frontend du service de devis en partant des modèles backend pour garantir une intégration propre et cohérente. Les améliorations comprennent :

1. Un nouveau client API robuste avec gestion correcte des en-têtes
2. Des interfaces TypeScript strictes correspondant aux modèles Django
3. Des composants React modulaires et réutilisables
4. Une gestion centralisée des erreurs et des logs

## Étapes d'intégration

### 1. Tester la nouvelle implémentation

Avant d'intégrer complètement la nouvelle implémentation, vous pouvez exécuter les tests suivants pour vérifier que l'erreur 401 est résolue :

```typescript
// Dans la console du navigateur ou dans un composant de test
import runAuthenticationTest from './lib/api/test-auth';
import runComparisonTest from './lib/api/compare-clients';

// Tester l'authentification avec le nouveau client
runAuthenticationTest().then(result => {
  console.log('Test d\'authentification terminé', result);
});

// Comparer l'ancien et le nouveau client
runComparisonTest().then(result => {
  console.log('Test de comparaison terminé', result);
});
```

### 2. Mise à jour des routes

Pour intégrer les nouvelles pages dans l'application, mettez à jour le fichier de routes principal :

```typescript
// src/routes/index.ts ou équivalent
import { devisRoutes } from '../modules/quotes';

// Ajouter les routes de devis à vos routes existantes
const routes = [
  // Autres routes existantes
  ...devisRoutes
];

export default routes;
```

### 3. Remplacement progressif

Vous pouvez remplacer progressivement les anciens composants par les nouveaux :

1. Commencez par remplacer le client API (`client.ts` → `client.new.ts`)
2. Puis remplacez le service API des devis (`quotes.ts` → `quotes.new.ts`)
3. Ensuite, remplacez les composants et pages un par un

### 4. Nettoyage

Une fois que vous avez vérifié que tout fonctionne correctement, vous pouvez :

1. Renommer les fichiers `.new.tsx` en supprimant le suffixe `.new`
2. Supprimer les anciens fichiers obsolètes
3. Mettre à jour les imports dans toute l'application

## Structure des fichiers

```
src/
├── lib/
│   ├── api/
│   │   ├── client.new.ts         # Nouveau client API centralisé
│   │   ├── quotes.new.ts         # Service API pour les devis
│   │   ├── types/
│   │   │   └── quotes.types.ts   # Types et interfaces pour les devis
│   │   ├── test-auth.ts          # Utilitaire de test d'authentification
│   │   └── compare-clients.ts    # Utilitaire de comparaison des clients
│   └── utils/
│       └── formatters.ts         # Utilitaires de formatage
├── components/
│   └── quotes/
│       ├── QuoteStats.new.tsx    # Statistiques des devis
│       ├── QuoteFilters.new.tsx  # Filtres pour la liste des devis
│       ├── QuoteList.new.tsx     # Liste des devis
│       └── QuoteForm.new.tsx     # Formulaire de création/édition
├── pages/
│   ├── Devis.new.tsx             # Page principale des devis
│   ├── DevisNew.new.tsx          # Page de création de devis
│   ├── QuoteDetail.new.tsx       # Page de détail d'un devis
│   └── QuoteEditor.new.tsx       # Page d'édition d'un devis
├── routes/
│   └── devis.routes.new.tsx      # Configuration des routes
└── modules/
    └── quotes/
        └── index.ts              # Export centralisé du module
```

## Dépendances requises

Assurez-vous que les dépendances suivantes sont installées :

```bash
npm install jwt-decode axios react-router-dom
```

## Points d'attention pour le backend

1. Vérifiez que la configuration CORS du backend autorise l'en-tête `X-Tenant-ID`
2. Assurez-vous que le middleware Django `TenantSchemaMiddleware` fonctionne correctement
3. Vérifiez que l'authentification JWT est correctement configurée

## Conclusion

Cette nouvelle implémentation résout l'erreur 401 en garantissant que :

1. Les en-têtes d'authentification et de tenant sont correctement envoyés
2. Les structures de données frontend correspondent exactement aux modèles backend
3. La gestion des erreurs est améliorée pour faciliter le débogage

Si vous rencontrez encore des problèmes, utilisez les outils de test fournis pour diagnostiquer les erreurs.

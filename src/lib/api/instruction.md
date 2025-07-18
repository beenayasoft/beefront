### Objectif du test : réduction de la latence
Je souhaite effectuer un remplacement pour résoudre un problème de latence en remplaçant definitivement l’appel actuel par un appel direct à l’API REST de **Supabase**. Le but est de remplacer progressivement les endpoints localhosts par leur equivalent supabase et facon maintenable optimiser pour la plus faible latence possible car on va en production.Apres voir analyser les endpoinst qui seront changer et par quoi il seront changer . fais moi la liste sosu forme de tableau sans code et quand je validela liste tu peux implementer masi il est essentiel d'avoir ma validation.

voici SUPABASE_CLIENT_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aW90c255YWx4Z214YWRnd3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTM2NTgsImV4cCI6MjA2NTU2OTY1OH0.-QLBXcHDe5xWFM1YMOQ27Npw2q7SeokKH-7yFEhyh5A

en bonne pratique stock le d'aborddansuen variable d'environnement avant d'utiliser. Pour chaque endpoints implemente le caceh que nous veons de faire avec redis cache vue 360
---

### Construction d’un endpoint Supabase

Les endpoints REST de Supabase suivent la structure suivante :

```
https://<PROJECT_ID>.supabase.co/rest/v1/<nom_table>
```

Par exemple, pour accéder à la table `devis_quote` :

```
https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/devis_quote
```

---

### Exemple d'appel pour lire toutes les lignes d'une table

```bash
curl 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/devis_quote?select=*' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY"
```

---

### À faire :

* Créer un **nouvel endpoint** qui interroge Supabase via son API REST et récupère les données de la table `devis_quote`.
* Ce nouvel endpoint ne doit **pas impacter les endpoints statistiques**, qui doivent rester en local.
* Ajouter un **cache Redis** avec une durée de **360 secondes** pour ce nouvel endpoint.
* Optimiser le endpoint pour obtenir **la latence la plus faible possible** (ex. : limiter les colonnes, activer la pagination si nécessaire, éviter les surcharges inutiles).

---

### Exemples pour la table `facturation_invoice`

Voici les formats d’interaction disponibles pour la table `facturation_invoice` :

#### 🔹 Lire toutes les lignes

```bash
curl 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/facturation_invoice?select=*' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY"
```

#### 🔹 Lire des colonnes spécifiques

```bash
curl 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/facturation_invoice?select=some_column,other_column' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY"
```

#### 🔹 Lire les relations (tables référencées)

```bash
curl 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/facturation_invoice?select=some_column,other_table(foreign_key)' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY"
```

#### 🔹 Pagination

```bash
curl 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/facturation_invoice?select=*' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY" \
  -H "Range: 0-9"
```

#### 🔹 Filtres avancés (eq, gt, lt, like, in, etc.)

```bash
curl --get 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/facturation_invoice' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY" \
  -H "Range: 0-9" \
  -d "select=*" \
  -d "status=eq.paid"
```

---

### Autres opérations disponibles :

#### 🔸 Insertion

```bash
curl -X POST 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/facturation_invoice' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{ "some_column": "someValue", "other_column": "otherValue" }'
```

#### 🔸 Mise à jour

```bash
curl -X PATCH 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/facturation_invoice?some_column=eq.someValue' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{ "other_column": "updatedValue" }'
```

#### 🔸 Suppression

```bash
curl -X DELETE 'https://wyiotsnyalxgmxadgwsk.supabase.co/rest/v1/facturation_invoice?some_column=eq.someValue' \
  -H "apikey: SUPABASE_CLIENT_ANON_KEY" \
  -H "Authorization: Bearer SUPABASE_CLIENT_ANON_KEY"
```

---

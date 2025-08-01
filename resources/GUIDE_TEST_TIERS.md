# 🧪 Guide de Test Pratique - Création de Tiers

## ✅ **Corrections apportées**

### 🔧 **Types harmonisés** :
- ❌ **Supprimés** : "Propriétaire" et "Locataire" (non conformes au modèle de données)
- ✅ **Types communs** : Client, Prospect, Fournisseur, Partenaire, Sous-traitant
- ✅ **Logique exclusive** : Un tier ne peut pas être à la fois Prospect ET Client

### 🚨 **Règle métier critique** :
```
PROSPECT ⚔️ CLIENT = EXCLUSIF
Un tier est soit prospect, soit client, jamais les deux !
```

---

## 🎯 **Scénarios de test à réaliser**

### **Test 1 : Création Entreprise (Basique)**
**Objectif** : Vérifier que seule la raison sociale est obligatoire

**Données minimales** :
```
Type : Entreprise
Raison sociale : "Dupont Construction" ✅ OBLIGATOIRE
Types de relation : "Client" ✅ OBLIGATOIRE
```

**Autres champs** : Laisser vides (optionnels)
**Résultat attendu** : ✅ Création réussie

---

### **Test 2 : Création Particulier (Basique)**
**Objectif** : Vérifier que seul le nom est obligatoire

**Données minimales** :
```
Type : Particulier
Nom : "Martin" ✅ OBLIGATOIRE
Types de relation : "Client" ✅ OBLIGATOIRE
```

**Autres champs** : Laisser vides (optionnels)
**Résultat attendu** : ✅ Création réussie

---

### **Test 3 : Validation Exclusive Prospect/Client**
**Objectif** : Vérifier que Prospect + Client = ERREUR

**Tentative 1** :
```
Type : Entreprise
Raison sociale : "Test Exclusion"
Types de relation : ☑️ "Prospect" + ☑️ "Client"
```
**Résultat attendu** : ❌ Erreur "Un tier ne peut pas être à la fois client et prospect"

**Tentative 2** :
```
Type : Particulier  
Nom : "Durand"
Types de relation : ☑️ "Prospect" + ☑️ "Client"
```
**Résultat attendu** : ❌ Même erreur

---

### **Test 4 : Combinaisons autorisées**
**Objectif** : Vérifier que les autres combinaisons fonctionnent

**Exemple valide** :
```
Type : Entreprise
Raison sociale : "Multi-Services"
Types de relation : ☑️ "Client" + ☑️ "Fournisseur" + ☑️ "Partenaire"
```
**Résultat attendu** : ✅ Création réussie

---

### **Test 5 : Entreprise complète**
**Objectif** : Tester avec tous les champs optionnels

**Données complètes** :
```
== ENTREPRISE ==
Raison sociale : "Maçonnerie Dubois SARL"
Forme juridique : "SARL"
SIRET : "12345678900123"
Numéro TVA : "FR12345678901"
Code NAF : "4120A"
Types de relation : "Client"

== CONTACT ==
Nom : "Dubois"
Prénom : "Jean"
Fonction : "Gérant"
Email : "j.dubois@maconnerie-dubois.fr"
Téléphone : "06 12 34 56 78"

== ADRESSE ==
Libellé : "Siège social"
Rue : "15 rue des Artisans"
Code postal : "75011"
Ville : "Paris"
```

---

### **Test 6 : Particulier complet**
**Objectif** : Tester avec tous les champs optionnels

**Données complètes** :
```
== PARTICULIER ==
Nom : "Lambert"
Prénom : "Sophie"
Email : "sophie.lambert@email.fr"
Téléphone : "07 89 12 34 56"
Profession : "Architecte"
Types de relation : "Client"

== ADRESSE ==
Libellé : "Domicile"
Rue : "42 avenue de la République"
Code postal : "93100"
Ville : "Montreuil"
```

---

## 🔍 **Points à vérifier pendant les tests**

### ✅ **Interface utilisateur** :
- [ ] Les couleurs sont cohérentes (Bleu=Entreprise, Vert=Particulier)
- [ ] La barre de progression fonctionne
- [ ] Les onglets s'affichent correctement
- [ ] Les messages d'erreur sont clairs

### ✅ **Validation métier** :
- [ ] Prospect + Client = Erreur bloquante
- [ ] Autres combinaisons = OK
- [ ] Champs obligatoires respectés
- [ ] Formats email/téléphone validés

### ✅ **Sauvegarde API** :
- [ ] Données transmises correctement au backend
- [ ] Transformation des données réussie
- [ ] Pas d'erreur de réseau
- [ ] Rechargement de la liste des tiers

---

## 🚀 **Comment démarrer le test**

1. **Lancer l'application** :
   ```bash
   npm run dev
   ```

2. **Aller sur la page Tiers** : `/tiers`

3. **Cliquer sur "Nouveau"** → Sélectionner le type → Remplir le formulaire

4. **Tester chaque scénario** dans l'ordre

---

## 📊 **Format de retour de test**

Merci de me faire un retour sous cette forme :

```
✅ Test 1 (Entreprise basique) : RÉUSSI
❌ Test 3 (Exclusion) : Problème détecté - [description]
⚠️ Test 5 (Entreprise complète) : Partiellement réussi - [remarques]
```

---

Prêt pour les tests ! 🎯 
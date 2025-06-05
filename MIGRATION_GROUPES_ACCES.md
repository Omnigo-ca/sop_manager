# Migration vers les Groupes d'Accès

## 📋 Vue d'ensemble

Ce document décrit la migration du système d'attribution individuelle des procédures vers un système basé sur des groupes d'accès.

### ✨ Avant vs Après

**Avant (Système actuel):**
- Chaque procédure est attribuée individuellement à chaque utilisateur
- Table `SopAccess` pour les relations utilisateur ↔ procédure 
- Interface d'administration complexe pour gérer chaque assignation

**Après (Nouveau système):**
- Les procédures sont organisées en **groupes d'accès**
- Les utilisateurs sont assignés aux **groupes** plutôt qu'aux procédures individuelles
- 3 types de groupes prédéfinis :
  - 🔒 **Procédures Internes** - Pour les employés internes
  - 🌐 **Procédures Publiques** - Pour les clients
  - 👑 **Toutes les Procédures** - Pour les administrateurs

## 🏗️ Architecture du Nouveau Système

### Nouveaux Modèles

```prisma
model AccessGroup {
  id          String             @id @default(cuid())
  name        String             @unique
  description String?
  type        AccessGroupType    // INTERNAL, PUBLIC, ADMIN
  sops        sop[]              @relation("SopAccessGroup")
  users       UserAccessGroup[]  @relation("AccessGroupUsers")
}

model UserAccessGroup {
  userId        String
  accessGroupId String
  assignedAt    DateTime @default(now())
  assignedBy    String?  // ID de l'admin qui a fait l'assignation
}
```

### Modifications des Modèles Existants

```prisma
model sop {
  // Nouveau champ
  accessGroupId String     // Référence au groupe d'accès
  accessGroup  AccessGroup @relation("SopAccessGroup")
  
  // Ancien champ conservé temporairement pour la migration
  access       SopAccess[] @relation("SopAccess")
}
```

## 🚀 Instructions de Migration

### 1. Exécuter la Migration Automatique

```bash
# Exécuter le script de migration complet
node migrate-and-setup.js
```

Ce script va :
1. 📝 Créer la migration Prisma
2. 🔧 Générer le nouveau client Prisma  
3. 📊 Migrer les données existantes

### 2. Migration Manuelle (Alternative)

Si vous préférez exécuter chaque étape manuellement :

```bash
# 1. Créer et appliquer la migration
npx prisma migrate dev --name add_access_groups

# 2. Générer le client Prisma
npx prisma generate

# 3. Migrer les données
node migration-to-access-groups.js
```

## 📊 Logique de Migration des Données

### Groupes Créés Automatiquement

1. **"Procédures Internes"** (type: INTERNAL)
   - Pour les procédures de l'organisation
   - Assigné aux utilisateurs avec rôle `AUTHOR`

2. **"Procédures Publiques"** (type: PUBLIC)  
   - Pour les procédures accessibles aux clients
   - Assigné aux utilisateurs avec rôle `USER`

3. **"Toutes les Procédures"** (type: ADMIN)
   - Accès complet à toutes les procédures
   - Assigné aux utilisateurs avec rôle `ADMIN`

### Assignation des SOPs

- SOPs avec catégorie contenant "interne" → Groupe INTERNAL
- SOPs avec catégorie contenant "public" ou "client" → Groupe PUBLIC  
- Autres SOPs → Groupe INTERNAL (par défaut)

### Assignation des Utilisateurs

- `ADMIN` → Groupe "Toutes les Procédures"
- `AUTHOR` → Groupe "Procédures Internes"
- `USER` → Groupe "Procédures Publiques"

## 🎯 Nouvelles Fonctionnalités

### Interface d'Administration

- **Nouvelle page**: `/admin/manage-access-groups`
- Vue par cartes des groupes d'accès
- Gestion simple des utilisateurs par groupe
- Statistiques en temps réel (nombre de SOPs, utilisateurs)

### APIs

- `GET /api/access-groups` - Liste des groupes d'accès
- `POST /api/access-groups` - Création d'un nouveau groupe
- `POST /api/access-groups/assign` - Assignation d'utilisateurs
- `DELETE /api/access-groups/assign` - Retrait d'utilisateurs

## 🔒 Sécurité et Permissions

Le système de permissions reste inchangé :
- **Admins** : Accès complet à toutes les SOPs
- **Authors** : Peuvent créer des SOPs et accéder à leurs groupes assignés
- **Users** : Lecture seule des SOPs de leurs groupes assignés

## 🧪 Tests et Validation

### Vérifications Post-Migration

1. **Groupes d'accès créés**
   ```bash
   # Vérifier via l'interface admin ou API
   curl http://localhost:3000/api/access-groups
   ```

2. **Utilisateurs assignés**
   - Connectez-vous avec différents comptes de test
   - Vérifiez l'accès aux procédures selon les groupes

3. **SOPs correctement assignées**
   - Vérifiez que les SOPs apparaissent aux bons utilisateurs
   - Testez la création de nouvelles SOPs

## 🎭 Compatibilité et Transition

### Période de Transition

- L'ancien système `SopAccess` est conservé temporairement
- Les fonctions d'accès vérifient les deux systèmes (nouveau en priorité)
- Permet un rollback si nécessaire

### Suppression de l'Ancien Système

Une fois le nouveau système validé :

```bash
# Supprimer les anciens accès individuels
npx prisma migrate dev --name remove_old_sop_access
```

## 🚨 Dépannage

### Erreurs Communes

1. **Erreur de connexion à la base de données**
   ```bash
   # Vérifier les variables d'environnement
   echo $DATABASE_URL
   ```

2. **Client Prisma non généré**
   ```bash
   # Régénérer le client
   npx prisma generate
   ```

3. **Migration échouée**
   ```bash
   # Reset si nécessaire (ATTENTION: perte de données)
   npx prisma migrate reset
   ```

## 📞 Support

En cas de problème :
1. Vérifiez les logs de la migration
2. Consultez la base de données directement
3. Utilisez le rollback si nécessaire

---

Cette migration améliore significativement la gestion des accès en simplifiant l'administration tout en offrant plus de flexibilité pour l'organisation des permissions. 
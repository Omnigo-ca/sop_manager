# SOP Manager

Application web moderne pour la gestion des procédures opérationnelles standard (SOP - Standard Operating Procedures).

## 📋 À propos du projet

SOP Manager est une application web qui permet de créer, gérer et partager des procédures opérationnelles standard au sein d'une organisation. Elle offre une interface utilisateur intuitive pour documenter les processus métier, attribuer des droits d'accès par groupes et garantir leur bonne exécution.

## 🛠️ Technologies utilisées

- **Frontend**: 
  - Next.js 15 avec App Router
  - React 19
  - TailwindCSS pour le styling
  - Radix UI pour les composants accessibles
  - React Hook Form pour la gestion des formulaires
  - Zod pour la validation des données
  - Recharts pour les visualisations graphiques

- **Backend**: 
  - API Routes de Next.js
  - Prisma ORM pour l'accès à la base de données
  - Swagger pour la documentation API

- **Authentification**: 
  - Clerk avec gestion des rôles (Admin, Auteur, Utilisateur)
  - Webhooks pour l'intégration avec d'autres services

- **Base de données**: 
  - MySQL 8.0
  - Migrations Prisma pour la gestion du schéma

- **Déploiement**:
  - Docker et Docker Compose
  - Configuration multi-conteneurs

- **Tests**:
  - Jest et React Testing Library

## 🗂️ Structure du projet

```
sop-manager/
├── app/                # Pages et routes Next.js
│   ├── api/            # Routes API
│   │   ├── sops/       # API pour les procédures
│   │   ├── users/      # API pour les utilisateurs
│   │   └── webhooks/   # Webhooks (ex: Clerk)
│   ├── admin/          # Interface d'administration
│   ├── docs/           # Documentation API (Swagger)
│   ├── sign-in/        # Page de connexion
│   ├── sign-up/        # Page d'inscription
│   └── page.tsx        # Page d'accueil
├── components/         # Composants React réutilisables
├── hooks/              # Custom React hooks
├── lib/                # Utilitaires et logiques métier
│   └── generated/      # Code Prisma généré
├── prisma/             # Schéma et migrations de base de données
├── public/             # Fichiers statiques
└── styles/             # Styles globaux
```

## 🗄️ Schéma de la base de données

![Schéma de la base de données](./BDD_Diagram.png)

Le schéma comprend les tables principales suivantes:
- **sop**: Stocke les procédures avec leurs détails (instructions, étapes, priorité, etc.)
- **user**: Gère les utilisateurs et leurs rôles (Admin, Auteur, Utilisateur)
- **AccessGroup**: Définit les groupes d'accès pour contrôler les permissions
- **UserAccessGroup**: Table de jonction entre utilisateurs et groupes d'accès
- **SopAccessGroup**: Table de jonction entre procédures et groupes d'accès

## ✨ Fonctionnalités

- **Système d'authentification** complet avec différents rôles:
  - Administrateurs: gestion complète du système et des utilisateurs
  - Auteurs: création et modification des procédures
  - Utilisateurs: consultation des procédures selon leurs droits d'accès

- **Gestion des procédures**:
  - Éditeur riche avec support Markdown
  - Organisation par catégories, tags et niveaux de priorité
  - Création de procédures avec instructions étape par étape
  - Versionnement des procédures

- **Contrôle d'accès avancé**:
  - Gestion des groupes d'accès
  - Attribution de procédures à des groupes spécifiques
  - Restrictions d'accès basées sur les rôles et groupes

- **Recherche et navigation**:
  - Recherche textuelle complète
  - Filtrage multi-critères (catégorie, priorité, tags)
  - Interface responsive adaptée à tous les appareils

- **Administration**:
  - Tableau de bord pour les administrateurs
  - Métriques d'utilisation et statistiques
  - Gestion des utilisateurs et de leurs droits

- **Documentation API**:
  - Interface Swagger pour explorer et tester l'API
  - Documentation interactive des endpoints

## 🚀 Comment démarrer

### Prérequis

- Node.js 20 ou plus récent
- MySQL 8.0
- Un compte Clerk pour l'authentification

### Installation et configuration

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd sop-manager
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/sop_manager"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=votre_clé_publique
   CLERK_SECRET_KEY=votre_clé_secrète
   ```

4. **Initialiser la base de données**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Alimenter la base de données avec des données de test (optionnel)**
   ```bash
   npx prisma db seed
   ```

6. **Lancer l'application en mode développement**
   ```bash
   npm run dev
   ```

7. **Accéder à l'application**
   Ouvrez votre navigateur et accédez à `http://localhost:3000`

## 🧪 Tests

Pour exécuter les tests:

```bash
npm test
```

## 🐳 Utilisation avec Docker

1. **Builder l'image Docker**
   ```bash
   docker build -t sop-manager .
   ```

2. **Lancer le conteneur**
   ```bash
   docker run --env-file .env -p 3000:3000 sop-manager
   ```

3. **Webhooks Clerk**
   Pour développer en local, exposez le port 3000 avec ngrok pour recevoir les webhooks Clerk.

## Déploiement avec Docker Compose

Pour déployer l'application complète avec Docker Compose:

1. Assurez-vous que Docker et Docker Compose sont installés sur votre machine.

2. Clonez le dépôt:
   ```bash
   git clone <repository-url>
   cd sop-manager
   ```

3. Configurez vos variables d'environnement dans le fichier docker-compose.yml ou utilisez un fichier .env.

4. Lancez les conteneurs avec Docker Compose:
   ```bash
   docker-compose up -d
   ```

5. L'application sera disponible à l'adresse http://localhost:3000

6. Pour arrêter les conteneurs:
   ```bash
   docker-compose down
   ```

7. Pour voir les logs:
   ```bash
   docker-compose logs -f
   ```

8. Pour conserver les données de la base de données lors de l'arrêt:
   ```bash
   docker-compose down --volumes
   ```

## 📝 Licence

Tous droits réservés. Ce logiciel est la propriété de l'entreprise.

## 📊 Couverture de Tests

### Interface de couverture interactive

Cette application intègre une interface HTML complète pour visualiser la couverture de code :

#### 🚀 **Accès local**
```bash
# Générer et voir la couverture
npm run test:coverage

# Ouvrir l'interface HTML
npm run coverage:view
```

#### 🌐 **Accès distant (SSH/Cursor)**

Pour les développeurs utilisant Cursor via SSH avec port forwarding :

```bash
# Solution simple et fiable (Recommandée)
npm run coverage:dev

# Solution avec gestion d'erreurs avancée
npm run coverage:remote

# Génération seule (sans seuils)
npm run test:coverage:no-threshold
```

**Configuration Cursor :**
1. Configurer le port forwarding `3001` dans Cursor
2. Ouvrir `http://localhost:3001` dans votre navigateur Windows
3. Explorer l'interface interactive de couverture

#### 📋 **Documentation complète**
- 📚 [**Index de toute la documentation**](docs/README.md) - Vue d'ensemble
- 🚀 [**Guide de démarrage rapide**](docs/QUICK_START_COVERAGE.md) - Pour commencer en 30 secondes
- 🌐 [**Accès distant SSH/Cursor**](docs/COVERAGE_REMOTE_ACCESS.md) - Configuration détaillée pour Cursor
- 📊 [**Guide complet de la couverture**](docs/TESTING_COVERAGE.md) - Documentation exhaustive

#### 🎯 **Métriques de couverture**
- **Lines** : >50% (Lignes de code exécutées)
- **Functions** : >40% (Fonctions appelées)
- **Branches** : >40% (Conditions testées)
- **Statements** : >50% (Instructions exécutées)

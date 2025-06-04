# SOP Manager

Application web moderne pour la gestion des procédures opérationnelles standard (SOP - Standard Operating Procedures).

## 📋 À propos du projet

SOP Manager est une application web qui permet de créer, gérer et partager des procédures opérationnelles standard au sein d'une organisation. Elle offre une interface utilisateur intuitive pour documenter les processus métier et garantir leur bonne exécution.

## 🛠️ Technologies utilisées

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: API Routes de Next.js
- **Authentification**: Clerk
- **Base de données**: MySQL avec Prisma ORM
- **UI Components**: Radix UI
- **Autres**: TypeScript, Zod pour la validation, Recharts, React Hook Form

## 🗂️ Structure du projet

```
sop-manager/
├── app/                # Pages et routes Next.js
│   ├── api/            # Routes API
│   │   ├── sops/       # API pour les procédures
│   │   ├── users/      # API pour les utilisateurs
│   │   └── webhooks/   # Webhooks (ex: Clerk)
│   ├── sign-in/        # Page de connexion
│   ├── sign-up/        # Page d'inscription
│   └── page.tsx        # Page d'accueil
├── components/         # Composants React réutilisables
├── lib/                # Utilitaires et logiques métier
├── prisma/             # Schéma et migrations de base de données
└── types/              # Définitions TypeScript
```

## ✨ Fonctionnalités

- **Authentification** complète avec différents rôles (Admin, Auteur, Utilisateur)
- **Création et édition** de procédures avec éditeur riche
- **Catégorisation** des procédures par tags et priorités
- **Recherche et filtrage** des procédures
- **Export** des procédures en PDF
- **Interface responsive** adaptée à tous les appareils

## 🚀 Comment démarrer

### Prérequis

- Node.js 20 ou plus récent
- MySQL
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

5. **Lancer l'application en mode développement**
   ```bash
   npm run dev
   ```

6. **Accéder à l'application**
   Ouvrez votre navigateur et accédez à `http://localhost:3000`

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

Pour déployer l'application avec Docker Compose:

1. Assurez-vous que Docker et Docker Compose sont installés sur votre machine.

2. Clonez le dépôt:
   ```bash
   git clone <repository-url>
   cd sop-manager
   ```

3. Lancez les conteneurs avec Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. L'application sera disponible à l'adresse http://localhost:3000

5. Pour arrêter les conteneurs:
   ```bash
   docker-compose down
   ```

6. Pour voir les logs:
   ```bash
   docker-compose logs -f
   ```

7. Si vous souhaitez conserver les données de la base de données lors de l'arrêt, utilisez:
   ```bash
   docker-compose down --volumes
   ```

## 📝 Licence

Tous droits réservés. Ce logiciel est la propriété de l'entreprise.

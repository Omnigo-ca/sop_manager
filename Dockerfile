# Utilise une image Node officielle comme image de base
FROM node:20-alpine AS base

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le reste du code
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Builder l'app Next.js
RUN npm run build

# Lancer l'app en mode production
CMD ["npm", "run", "start"]

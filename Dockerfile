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

# Créer un script pour attendre la base de données
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "Waiting for MySQL to be available..."' >> /app/entrypoint.sh && \
    echo 'npx wait-on -t 60000 tcp:db:3306' >> /app/entrypoint.sh && \
    echo 'echo "MySQL is up - executing command"' >> /app/entrypoint.sh && \
    echo 'npx prisma db push --force-reset' >> /app/entrypoint.sh && \
    echo 'echo "Running seed script to populate database with initial data..."' >> /app/entrypoint.sh && \
    echo 'node prisma/seed.js' >> /app/entrypoint.sh && \
    echo 'exec "$@"' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Définir le point d'entrée pour attendre la base de données
ENTRYPOINT ["/app/entrypoint.sh"]

# Lancer l'app en mode production
CMD ["npm", "run", "start"]

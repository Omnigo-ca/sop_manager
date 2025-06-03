## 🚀 Utilisation avec Docker

1. **Configurer les variables d'environnement**
   - Crée un fichier `.env` (ou utilise tes variables d'environnement locales)
   - Assure-toi que `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `SIGNING_SECRET` sont bien définis

2. **Builder l'image Docker**
   ```bash
   docker build -t sop-manager .
   ```

3. **Lancer le conteneur**
   ```bash
   docker run --env-file .env -p 3000:3000 sop-manager
   ```

4. **Connexion à la base de données**
   - La base MySQL doit être accessible depuis le conteneur (externe ou via un autre conteneur)
   - Exemple de `DATABASE_URL` :
     ```
     DATABASE_URL="mysql://user:password@host:3306/sop_manager"
     ```

5. **Webhooks Clerk**
   - Si tu développes en local, expose le port 3000 avec ngrok pour recevoir les webhooks Clerk.

--- 